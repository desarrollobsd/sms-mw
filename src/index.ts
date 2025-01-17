import { Hono } from 'hono'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { messageAnalyzerPrompt, promptConfig, AnalyzerResponse } from './prompts/messageAnalyzer'

type Bindings = {
  GEMINI_API_KEY: string
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

const authMiddleware = async (c: any, next: any) => {
  const apiKey = c.req.header('x-api-key')
  
  if (!apiKey || apiKey !== c.env.API_KEY) {
    return c.json({ error: 'Acceso no autorizado' }, 401)
  }
  
  await next()
}

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Definimos una interfaz para el cuerpo de la petición
interface RequestBody {
  mensaje: string;
  prompt?: string;
}

app.post('/analizar-mensaje', authMiddleware, async (c) => {
  try {
    let mensaje: string;
    let promptPersonalizado: string | undefined;
    const contentType = c.req.header('Content-Type');

    // Añadimos logs para depuración
    console.log('Content-Type:', contentType);

    if (contentType?.includes('application/json')) {
      const body = await c.req.json();
      console.log('Body recibido:', body);
      mensaje = body.mensaje;
      promptPersonalizado = body.prompt;
    } else {
      mensaje = await c.text();
      console.log('Texto recibido:', mensaje);
    }

    // Validación más explícita
    if (!mensaje) {
      return c.json({ 
        error: 'Mensaje no proporcionado',
        detalles: 'El campo mensaje es requerido'
      }, 400);
    }

    if (mensaje.trim() === '') {
      return c.json({ 
        error: 'Mensaje vacío',
        detalles: 'El mensaje no puede estar vacío'
      }, 400);
    }

    const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY)
    
    const prompt = {
      prompt: promptPersonalizado || messageAnalyzerPrompt(mensaje),
      ...promptConfig
    }

    console.log('Enviando prompt a Gemini...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(prompt.prompt)
    const response = await result.response.text()

    try {
      const cleanResponse = response
        .replace(/```json\n/, '')
        .replace(/\n```$/, '')
        .trim()

      const jsonResponse = JSON.parse(cleanResponse) as AnalyzerResponse
      return c.json(jsonResponse)
    } catch (parseError) {
      return c.json({ 
        error: 'Error al parsear la respuesta',
        respuesta_original: response,
        detalles_error: (parseError as Error).message
      })
    }

  } catch (error) {
    return c.json({ 
      error: 'Error al analizar el mensaje',
      detalles: (error as Error).message,
      stack: (error as Error).stack
    }, 500)
  }
})

export default app
