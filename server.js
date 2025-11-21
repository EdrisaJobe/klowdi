import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import { getWeatherDataTool, formatWeatherData } from './server-utils/weather.js'

// Load environment variables from .env file (for local development)
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Elevation data cache
const elevationCache = new Map()
const CACHE_DURATION = 3600000 // 1 hour

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Elevation data proxy endpoint (to avoid CORS)
app.post('/api/elevation', async (req, res) => {
  try {
    const { lat, lon } = req.body
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing lat or lon parameters' })
    }
    
    // Round coordinates to reduce cache misses
    const roundedLat = Math.round(lat * 100) / 100
    const roundedLon = Math.round(lon * 100) / 100
    const cacheKey = `${roundedLat},${roundedLon}`
    
    // Check cache first
    const cached = elevationCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Elevation cache hit for ${cacheKey}`)
      return res.json(cached.data)
    }
    
    console.log(`Fetching elevation data for ${roundedLat}, ${roundedLon}`)
    
    // Generate points in a circle around the location
    const radius = 0.05
    const points = 36
    const locations = []
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2
      const pointLat = roundedLat + Math.sin(angle) * radius
      const pointLon = roundedLon + Math.cos(angle) * radius
      locations.push({ latitude: pointLat, longitude: pointLon })
    }
    
    // Call the elevation API
    const response = await axios.post('https://api.open-elevation.com/api/v1/lookup', 
      { locations },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    )
    
    const elevations = response.data.results.map(result => 
      result.elevation === null ? 0 : result.elevation
    )
    
    const result = {
      elevations,
      min: Math.min(...elevations),
      max: Math.max(...elevations)
    }
    
    // Cache the result
    elevationCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })
    
    console.log(`Elevation data cached for ${cacheKey}`)
    res.json(result)
    
  } catch (error) {
    console.error('Elevation API error:', error)
    
    // If API fails, return fallback data
    const { lat, lon } = req.body
    const baseElevation = Math.abs(lat) * 10
    const coastalEffect = Math.sin(lon * Math.PI / 180) * 50
    
    const points = 36
    const fallbackData = Array.from({ length: points }, (_, i) => {
      const angle = (i / points) * Math.PI * 2
      const terrainVariation = Math.sin(angle * 3) * 30
      const positionSeed = lat * 1000 + lon * 1000 + i
      const deterministicNoise = Math.sin(positionSeed) * 10
      return Math.max(0, baseElevation + coastalEffect + terrainVariation + deterministicNoise)
    })
    
    const result = {
      elevations: fallbackData,
      min: Math.min(...fallbackData),
      max: Math.max(...fallbackData),
      fallback: true
    }
    
    console.log('WARNING: Using fallback elevation data')
    res.json(result)
  }
})

// Test RapidAPI connection endpoint
app.get('/api/test-chat', async (req, res) => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ error: 'RAPIDAPI_KEY not set' })
    }
    
    console.log('Testing RapidAPI connection...')
    
    // Try gpt4 endpoint first
    try {
      const response = await axios.request({
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/gpt4',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          messages: [
            {
              role: 'user',
              content: 'Say hello in one word.'
            }
          ],
          web_access: false
        },
        timeout: 10000
      })
      
      console.log('GPT-4 endpoint working')
      return res.json({ success: true, endpoint: 'gpt4', response: response.data })
    } catch (gpt4Error) {
      console.log('WARNING: GPT-4 endpoint failed, trying conversationgpt...')
      
      // Fallback to conversationgpt
      const response = await axios.request({
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/conversationgpt',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          messages: [
            {
              role: 'user',
              content: 'Say hello in one word.'
            }
          ],
          system_prompt: 'You are a helpful assistant.',
          web_access: false
        },
        timeout: 10000
      })
      
      console.log('conversationgpt endpoint working')
      return res.json({ success: true, endpoint: 'conversationgpt', response: response.data })
    }
  } catch (error) {
    console.error('RapidAPI test error:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: axios.isAxiosError(error) ? {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      } : undefined
    })
  }
})

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('Received /api/chat request')
  try {
    const { messages, currentLocation, currentWeather } = req.body
    console.log('Request body received:', { 
      messageCount: messages?.length || 0, 
      hasLocation: !!currentLocation, 
      hasWeather: !!currentWeather 
    })

    if (!process.env.RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY is not set in environment variables')
      return res.status(500).json({ error: 'RapidAPI key not configured. Please set RAPIDAPI_KEY in your .env file or environment variables.' })
    }

    console.log('RapidAPI key found, processing chat request...')
    
    // Get the last user message (RapidAPI expects a single text input)
    const lastMessage = messages && messages.length > 0 
      ? messages[messages.length - 1] 
      : { role: 'user', content: 'Hello' }
    
    // Build context-aware prompt
    let prompt = lastMessage.content || ''
    
    // Add context about current location and weather if available
    if (currentLocation && currentWeather) {
      const locationInfo = `Current location: ${currentLocation.name || `${currentLocation.lat}, ${currentLocation.lon}`}. `
      const weatherInfo = `Current weather: ${currentWeather.weather[0].description}, ${Math.round((currentWeather.main.temp * 9/5) + 32)}°F, humidity ${currentWeather.main.humidity}%, wind ${currentWeather.wind.speed} m/s. `
      prompt = `Context: ${locationInfo}${weatherInfo}User question: ${prompt}`
    }
    
    // Add conversation history context if available
    if (messages && messages.length > 1) {
      const conversationContext = messages
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')
      prompt = `Previous conversation:\n${conversationContext}\n\nCurrent question: ${prompt}`
    }

    // Add system instructions
    prompt = `You are a helpful weather assistant. You can answer questions about weather for any location. ${prompt}`

    // Check if user is asking about weather for a specific location
    const locationMatch = prompt.match(/(?:weather|temperature|forecast|climate).*?(?:in|at|for)\s+([A-Za-z\s,]+?)(?:[?.!]|$)/i)
    if (locationMatch) {
      const location = locationMatch[1].trim()
      try {
        const weatherResult = await getWeatherDataTool(location)
        const weatherInfo = formatWeatherData(weatherResult)
        prompt = `${prompt}\n\nHere is the current weather data:\n${weatherInfo}\n\nPlease provide a helpful response based on this data.`
      } catch (error) {
        console.log('Could not fetch weather for location:', location)
      }
    }

    console.log('Sending request to RapidAPI...')
    console.log('Prompt length:', prompt.length)
    
    // Validate prompt length (many APIs have limits)
    if (prompt.length > 2000) {
      prompt = prompt.substring(0, 2000)
      console.log('WARNING: Prompt truncated to 2000 characters')
    }
    
    let response
    try {
      // Try the gpt-4o-mini endpoint first (more reliable)
      response = await axios.request({
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/gpt4',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          messages: [
            {
              role: 'system',
              content: 'You are a helpful weather assistant. Provide concise, accurate responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          web_access: false
        },
        timeout: 30000 // 30 second timeout
      })
    } catch (gpt4Error) {
      console.log('WARNING: GPT-4 endpoint failed, trying conversationgpt endpoint...')
      // Fallback to conversationgpt endpoint
      response = await axios.request({
        method: 'POST',
        url: 'https://chatgpt-42.p.rapidapi.com/conversationgpt',
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          system_prompt: 'You are a helpful weather assistant.',
          temperature: 0.7,
          top_k: 40,
          top_p: 0.9,
          max_tokens: 500,
          web_access: false
        },
        timeout: 30000
      })
    }

    console.log('RapidAPI response status:', response.status)
    console.log('RapidAPI response data:', JSON.stringify(response.data, null, 2))

    // Set headers for streaming-like response (simulate streaming by sending chunks)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Extract response text - try different possible response formats
    let responseText = ''
    if (typeof response.data === 'string') {
      responseText = response.data
    } else if (response.data?.result !== undefined && response.data?.result !== null) {
      // Handle result - could be string, object, number, or array
      const result = response.data.result
      if (typeof result === 'string') {
        responseText = result
      } else if (typeof result === 'object' && result !== null) {
        // If result is an object, try to extract text from common fields
        responseText = result.text || result.message || result.content || result.response || result.data || JSON.stringify(result)
      } else {
        // If result is a number or other type, convert to string
        responseText = String(result)
      }
    } else if (response.data?.response) {
      responseText = typeof response.data.response === 'string' ? response.data.response : String(response.data.response)
    } else if (response.data?.text) {
      responseText = typeof response.data.text === 'string' ? response.data.text : String(response.data.text)
    } else if (response.data?.message) {
      responseText = typeof response.data.message === 'string' ? response.data.message : String(response.data.message)
    } else if (response.data?.content) {
      responseText = typeof response.data.content === 'string' ? response.data.content : String(response.data.content)
    } else if (response.data?.data) {
      responseText = typeof response.data.data === 'string' ? response.data.data : JSON.stringify(response.data.data)
    } else {
      responseText = JSON.stringify(response.data)
    }

    // Ensure responseText is a string
    if (typeof responseText !== 'string') {
      responseText = String(responseText)
    }

    console.log('Extracted response text type:', typeof responseText)
    console.log('Extracted response text length:', responseText.length)
    if (responseText && typeof responseText === 'string' && responseText.length > 0) {
      console.log('Response text preview:', responseText.substring(0, Math.min(100, responseText.length)))
    } else {
      console.log('Response text value:', responseText)
    }

    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Empty response from RapidAPI')
    }

    // Simulate streaming by sending the response in chunks
    const words = responseText.split(' ')
    
    for (let i = 0; i < words.length; i++) {
      const chunk = (i > 0 ? ' ' : '') + words[i]
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('='.repeat(50))
    console.error('Chat API error occurred:')
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error detected:')
      console.error('Status:', error.response?.status)
      console.error('Status text:', error.response?.statusText)
      console.error('Response data:', JSON.stringify(error.response?.data, null, 2))
      console.error('Request URL:', error.config?.url)
    } else {
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    }
    console.error('='.repeat(50))
    
    if (!res.headersSent) {
      // Provide a helpful fallback response instead of just an error
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      
      let fallbackMessage = ''
      
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        fallbackMessage = "I apologize, but I'm currently experiencing connectivity issues with the AI service. However, I can still help you with weather information! Try asking about weather in a specific location (e.g., 'What's the weather in New York?')."
      } else if (axios.isAxiosError(error) && error.response?.status === 429) {
        fallbackMessage = "I've reached my request limit for now. Please try again in a few moments. In the meantime, you can still view weather data on the map!"
      } else if (axios.isAxiosError(error) && error.response?.status === 403) {
        fallbackMessage = "There's an authentication issue with the AI service. The weather visualization features are still fully functional!"
      } else {
        fallbackMessage = "I'm having trouble connecting to my AI backend, but don't worry - all the weather visualization features are working perfectly! Try using the map controls to explore weather data."
      }
      
      // Send fallback message as streaming response
      const words = fallbackMessage.split(' ')
      for (let i = 0; i < words.length; i++) {
        const chunk = (i > 0 ? ' ' : '') + words[i]
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      }
      res.write('data: [DONE]\n\n')
      res.end()
      
      console.log('Sent fallback response to user')
    } else {
      res.end()
    }
  }
})

// serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')))

// needed for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
  console.log(`Serving from: ${path.join(__dirname, 'dist')}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`RapidAPI Key: ${process.env.RAPIDAPI_KEY ? 'Configured' : 'Not found - AI chat will not work'}`)
  console.log(`OpenWeather API Key: ${process.env.VITE_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY ? 'Configured' : 'Not found'}`)
})