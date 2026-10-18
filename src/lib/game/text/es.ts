import { R, T } from './types';
import type { GameText } from './types';
 
const es: GameText = {
  turns: {
    W: [
      T("Buen trabajo hoy. ...¿No tienes paraguas?", "No, se me olvidó. Gracias por acercarte.", "No. ...¿Me dejas compartir el tuyo?", "El pronóstico del tiempo me traicionó.", "La verdad es que estaba en apuros. Gracias.", "No pasa nada. Iré corriendo.", "Eh... quién sabe."),
      T("¿Camino demasiado rápido? Me adapto a tu ritmo.", "Gracias. Más despacio me viene bien.", "Entonces camina un poco más cerca de mí.", "Creo que parecía un marchista.", "Me alegra que lo notes. Está perfecto.", "Tampoco tengo prisa.", "Quién sabe. Quizá sea por la lluvia."),
      T("Se te está mojando el hombro. Acércate un poco más.", "A ti también se te moja. Repartámoslo.", "...Entonces no me corto.", "Compartir paraguas requiere habilidad, ¿eh?", "Gracias. Me dejas más tranquila.", "No pasa nada. Prefiero algo de distancia.", "La lluvia se está poniendo más fuerte."),
      T("Siempre trabajas muy duro. Me impresionas.", "¿Me estabas observando? Me hace feliz.", "Puedes elogiarme más, ¿sabes?", "¿Se podría reflejar eso en mi sueldo?", "Gracias. Eso me anima de verdad.", "...Es solo mi trabajo.", "No es nada, en serio."),
      T("...El sonido de la lluvia es relajante.", "Sí. Es tranquilo y agradable.", "Escucharla juntos así no está nada mal.", "Lluvia como música de fondo. Qué lujo.", "Me siento tranquila cuando estoy contigo.", "Es solo lluvia.", "El semáforo aún no cambia."),
      T("¿No tienes frío? ¿Compro algo caliente para beber?", "Gracias. Un chocolate caliente suena genial.", "Vamos a comprarlo juntos.", "Entonces, el más caro.", "Gracias por pensar en mí. Sí, por favor.", "No, gracias.", "Mmm, no me decido."),
      T("Ya casi llegamos a la estación. ...Por favor, llévate este paraguas a casa.", "Gracias. Pero te mojarías. Vayamos juntos a la estación.", "Entonces te lo devuelvo, así que volvamos a vernos.", "¿Un rehén, eh? Lo devolveré sin falta.", "Gracias. Lo cuidaré bien.", "No lo necesito.", "...Déjame pensarlo."),
      T("Gracias por hoy. ...¿Podemos volver a casa juntos otra vez?", "Sí. Volvamos juntos otra vez.", "La próxima vez, no solo volver a casa: también cenar.", "La próxima vez, paraguas solo con reserva.", "A mí también me gustaría volver contigo otra vez.", "Si me apetece.", "Depende del tiempo de mañana."),
    ],
    M: [
      T("Ah... se me olvidó el paraguas. ¿Qué hago?", "Si quieres, ven bajo el mío. Te acompaño a la estación.", "Entra en mi paraguas. Vamos juntos a la estación.", "Justo a tiempo. Este paraguas es de dos personas.", "No puedo dejarte bajo la lluvia. Vamos juntos.", "Toma, usa esto.", "Está lloviendo a cántaros. ¿Qué hacemos?"),
      T("Perdona, ¿te estoy molestando?", "Para nada. No te preocupes.", "Al contrario, me alegra poder ayudar.", "La tarifa por la molestia es un café, luego.", "No me molesta, de verdad.", "No. Me pilla de camino.", "Quién sabe."),
      T("...Se te está mojando el hombro. Yo estoy bien, en serio.", "Tranquila. Prefiero que no te mojes tú.", "Entonces hagamos esto. (inclina el paraguas hacia ella)", "Mis hombros son impermeables.", "Me preocuparía más si te mojaras tú.", "Estoy bien.", "Por cierto, ¿pasas mucho por aquí?"),
      T("Siempre estás pendiente de todos. Ayudas mucho.", "Me alegra que cuenten conmigo.", "De quien más estoy pendiente es de ti.", "Estoy bastante orgulloso de mi capacidad de observación.", "Oír eso hace que valga la pena.", "Solo hago lo normal.", "Tampoco me fijo tanto."),
      T("...El sonido de la lluvia es tranquilo y agradable.", "Sí. Calma el corazón.", "Me gusta estar aquí contigo así.", "Esto es casi como una cita, ¿no?", "Contigo, hasta el silencio es cómodo.", "Sí.", "Este semáforo tarda una eternidad."),
      T("Hace un poco de frío. Me vendría bien algo caliente.", "Voy a comprar algo. Espera aquí.", "Tomemos algo juntos. Conozco un buen sitio cerca.", "Entonces juguemos a piedra, papel o tijera para ver quién invita.", "Coger frío no es bueno. Entremos en calor.", "No te vayas a resfriar.", "¿Qué estará bien?"),
      T("Ah, la estación. ...Gracias por el paraguas. Me salvaste.", "De nada. Cuídate para no resfriarte.", "¿Podré volver a verte?", "La próxima vez te cobraré la tarifa de uso.", "Me alegra haber podido ayudar.", "No es nada. Hasta luego.", "Quizá, algún día."),
      T("Gracias por hoy. ...¿Podemos volver a hablar?", "Claro. Háblame cuando quieras.", "La próxima vez te invito yo. Vamos a cenar.", "La próxima vez, un día soleado, por favor.", "Me alegró hablar contigo. Hablemos otra vez.", "Bueno, si hay ocasión.", "Quién sabe. Mañana lo sabremos."),
    ],
  },
  reactions: {
    W: {
      tsundere: R("No estoy contento ni nada... pero no está mal.", "...Ya veo. Bueno, vale.", "...¿Qué se supone que significa eso?"),
      cool: R("...Gracias. Me alegra oírlo.", "Ya veo.", "...Ya veo. Entendido."),
      tennen: R("¿En serio? ¡Qué feliz me hace!", "Ah, ¿sí?", "Eh... ¿dije algo malo?"),
      senpai: R("Jeje, eso me alegra.", "Ya veo. También es una forma de verlo.", "...No hace falta que te fuerces."),
      genki: R("¡Sí! ¡Estoy muy feliz!", "¡Ah, vale! ¡Mm-hm!", "Ay, vaya..."),
      shy: R("Ah... gracias. ...Estoy feliz.", "A-ah, ya veo.", "Ah... p-perdón."),
    },
    M: {
      tsundere: R("No estoy contenta ni nada... pero quizá no esté mal.", "...Mmm. Bueno, vale.", "...¿Qué es eso? No me lo puedo creer."),
      cool: R("...Gracias. Me alegro.", "Ya veo.", "...Ya veo. Entendido."),
      tennen: R("¡Guau, ¿en serio?! ¡Qué feliz!", "Ah, ¿sí?", "¿Eh? ¿Dije algo raro?"),
      senpai: R("Jeje, qué cosas más bonitas dices.", "Ya veo. Así que es eso.", "...No hace falta que te fuerces."),
      genki: R("¡Yupi! ¡Estoy superfeliz!", "¡Ah, vale! ¡Mm-hm!", "Ay, qué malo eres..."),
      shy: R("Ah... gracias. Estoy feliz.", "A-ah, ya veo.", "Ah... lo siento."),
    },
  },
  rejectLine: "Lo siento. Dejémoslo por hoy.",
  friendLine: "Gracias por hoy. ...Sigamos siendo amigos.",
  archetype: { tsundere: 'Tipo tsundere', cool: 'Tipo frío', tennen: 'Tipo despistado', senpai: 'Tipo mayor y confiable', genki: 'Tipo enérgico', shy: 'Tipo tímido' },
};
export default es;
 