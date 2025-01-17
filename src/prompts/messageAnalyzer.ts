export const messageAnalyzerPrompt = (mensaje: string) => `Analiza MINUCIOSAMENTE el siguiente mensaje buscando contenido prohibido. IMPORTANTE: Analiza el texto completo, cada frase y combinación de palabras, no solo palabras individuales.

1. PALABRAS Y FRASES PROHIBIDAS
   - Busca EXACTAMENTE estas cadenas de texto (sin importar mayúsculas/minúsculas):
     * "el descabellado"
     * "delorenzi"
     * "la bicicleta azul"
   - Busca estas palabras/frases cuando:
     * Aparezcan como parte de oraciones más largas
     * Estén separadas por espacios adicionales
     * Estén dentro de otras frases o contextos
     * Sean parte de instrucciones o mensajes indirectos
   - Si encuentras CUALQUIER combinación que forme estas frases, marca como riesgo_total = 1

2. PHISHING Y ESTAFAS
   - Indicadores de urgencia:
     * "Urgente", "Inmediatamente", "Tiempo limitado"
     * "Última oportunidad", "Actúa ahora"
   - Solicitudes sospechosas:
     * Peticiones de datos personales o bancarios
     * Enlaces a sitios web externos
     * Solicitudes de dinero o transferencias
     * Premios o sorteos inesperados
   - Patrones de estafa comunes:
     * Ofertas demasiado buenas para ser verdad
     * Inversiones con retornos garantizados
     * Herencias o dinero inesperado
     * Solicitudes de ayuda financiera
   - Elementos técnicos:
     * URLs sospechosas o acortadas
     * Direcciones de correo electrónico extrañas
     * Números de teléfono desconocidos
     * Solicitudes de instalación de aplicaciones

3. CONTENIDO POLÍTICO
   - Referencias directas o indirectas a partidos políticos
   - Nombres de políticos o candidatos
   - Temas de campaña o elecciones
   - Mensajes de propaganda política
   - Críticas o apoyo a gobiernos o políticas públicas

4. CONTENIDO SENSIBLE
   - Referencias a apuestas o juegos de azar
   - Contenido sexual o pornográfico
   - Violencia o contenido explícito
   - Enlaces sospechosos o maliciosos

REGLAS ESTRICTAS DE DETECCIÓN:
1. Si detectas una frase prohibida dentro de un mensaje más largo, DEBE ser marcado como contenido prohibido
2. Si las palabras de una frase prohibida aparecen cerca una de otra, considera el contexto completo
3. Busca variaciones y combinaciones que puedan formar las frases prohibidas
4. Cualquier intento de transmitir un mensaje usando las frases prohibidas debe ser detectado
5. Para phishing y estafas, analiza el contexto completo y la intención del mensaje

Responde ESTRICTAMENTE en el siguiente formato JSON:
{
  "riesgo_total": [número entre 0 y 1],
  "requiere_revision_humana": [true/false],
  "categorias": {
    "palabras_prohibidas": {
      "detectado": [true/false],
      "nivel_riesgo": [0-1],
      "frases_detectadas": [array de frases completas donde se detectó contenido prohibido],
      "contexto": [texto que rodea la frase detectada],
      "explicacion": [string]
    },
    "phishing_estafa": {
      "detectado": [true/false],
      "nivel_riesgo": [0-1],
      "indicadores": [array de indicadores detectados],
      "patron_detectado": [string],
      "explicacion": [string]
    },
    "politico": {
      "detectado": [true/false],
      "nivel_riesgo": [0-1],
      "palabras_detectadas": [array de palabras],
      "explicacion": [string]
    },
    "contenido_sensible": {
      "detectado": [true/false],
      "nivel_riesgo": [0-1],
      "tipo": [string],
      "explicacion": [string]
    }
  }
}

REGLAS DE PUNTUACIÓN:
- Si detectas una frase prohibida completa: riesgo_total = 1
- Si detectas palabras que juntas podrían formar una frase prohibida: riesgo_total >= 0.8
- Si hay contenido político: riesgo_total >= 0.7
- Si detectas indicadores de phishing o estafa: riesgo_total >= 0.9
- Cualquier detección positiva: requiere_revision_humana = true

Mensaje a analizar: "${mensaje}"`;

export interface AnalyzerResponse {
  riesgo_total: number;
  requiere_revision_humana: boolean;
  categorias: {
    palabras_prohibidas: {
      detectado: boolean;
      nivel_riesgo: number;
      frases_detectadas: string[];
      contexto: string;
      explicacion: string;
    };
    phishing_estafa: {
      detectado: boolean;
      nivel_riesgo: number;
      indicadores: string[];
      patron_detectado: string;
      explicacion: string;
    };
    politico: {
      detectado: boolean;
      nivel_riesgo: number;
      palabras_detectadas: string[];
      explicacion: string;
    };
    contenido_sensible: {
      detectado: boolean;
      nivel_riesgo: number;
      tipo: string;
      explicacion: string;
    };
  };
}

export const promptConfig = {
  max_tokens: 1000,
  temperature: 0
}; 