// Contenido de ejemplo: sustituye nombres, textos y fotografías por los suyos.
// Para fotos locales: public/fotos/foto.jpg se escribe asset('fotos/foto.jpg').
const photo = (id, width = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export const story = {
  herName: 'Arely',
  yourName: 'Walter',
  initials: 'A + W',
  date: '30 · 09 · 2026',
  heroImage: photo('photo-1516589178581-6cd7833ae3b2', 2000),
  // Dos fotos de encuadre parecido producen un revelado más bonito.
  reveal: {
    image: asset('fotos/tazas.jpeg'),
    secondImage: asset('fotos/nosotros.jpeg'),
    alt: 'Nuestras dos tazas de café con dibujos en la espuma',
    secondAlt: 'Nosotros compartiendo un momento juntos',
    caption: 'Dos tazas, nuestro lugar y nosotros.',
  },
  moments: [
    { title: 'El día que todo empezó', date: '01 / El comienzo', image: photo('photo-1516589178581-6cd7833ae3b2', 1000), secondImage: asset('fotos/inicio.jpeg'), alt: 'Una pareja compartiendo un abrazo', text: 'No sabía que esa conversación iba a convertirse en mi lugar favorito. Desde entonces, las cosas pequeñas empezaron a tener otro color.' },
    { title: 'Nuestros lugares', date: '02 / Sin mirar la hora', image: photo('photo-1442512595331-e89e73853f31', 1000), secondImage: asset('fotos/nuestros_lugares.jpeg'), alt: 'Un café para compartir una tarde', text: 'Hay rincones que ya no me pertenecen solo a mí. En todos dejaste una risa, una mirada o un plan que se alargó demasiado.' },
    { title: 'Donde fuera, contigo', date: '03 / La aventura', image: photo('photo-1470770841072-f978cf4d019e', 1000), secondImage: asset('fotos/contigo.jpeg'), alt: 'Paisaje de un lago entre montañas', text: 'No fue el destino. Fuiste tú haciendo que cada vuelta, cada foto borrosa y cada cansancio valiera muchísimo la pena.' },
    { title: 'Un ratito más', date: '04 / Nuestro atardecer', image: photo('photo-1500534623283-312aade485b7', 1000), secondImage: asset('fotos/rato.mp4'), secondIsVideo: true, alt: 'La luz cálida del atardecer sobre el paisaje', text: 'De todas las formas de terminar un día, quedarme un ratito más contigo sigue siendo mi favorita.' },
    { title: 'Reír hasta que duela', date: '05 / Sin motivo', image: photo('photo-1529156069898-49953e39b3ac', 1000), secondImage: asset('fotos/reir.jpeg'), alt: 'Amigos disfrutando de un momento juntos', text: 'Las mejores fotos no siempre salen perfectas. Algunas salen movidas porque nos estábamos riendo demasiado.' },
    { title: 'Nuestra pausa', date: '06 / Lo cotidiano', image: photo('photo-1441974231531-c6227db76b6e', 1000), secondImage: asset('fotos/cotidiano.jpeg'), alt: 'Luz entrando entre los árboles del bosque', text: 'Me gustan los días sin nada extraordinario. Esos en los que estar juntos ya es un plan completo.' },
    { title: 'Volvería a elegirte', date: '07 / Una y otra vez', image: photo('photo-1522673607200-164d1b6ce486', 1000), secondImage: asset('fotos/otra_vez.jpeg'), alt: 'Una pareja abrazada al aire libre', text: 'Si pudiera volver a empezar, buscaría otra vez la manera de coincidir contigo.' },
    { title: 'Lo que nos falta', date: '08 / Continuará', image: photo('photo-1475924156734-496f6cac6ec1', 1000), secondImage: asset('fotos/continuara.jpg'), alt: 'El mar al caer el sol', text: 'Quedan lugares, canciones, domingos y miles de pequeñas primeras veces. Me emociona pensar que todavía tenemos tanto por vivir.' },
  ],
  littleThings: ['Tu forma de reír cuando ya no puedes parar.', 'Los audios que parecen podcasts enteros.', 'Cuando me agarras la mano sin pensarlo.', 'Que contigo hasta esperar se siente bien.'],
  futureLetter: 'Quiero seguir haciendo planes contigo. Los grandes, los improvisados y los que consisten solo en quedarnos un rato más. Que nunca nos falten las ganas de descubrir el mundo ni las de volver al lugar donde estamos los dos.',
  birthday: {
    image: photo('photo-1516589178581-6cd7833ae3b2', 2000),
    alt: 'Una pareja abrazada en una fotografía de recuerdo',
    message: 'Gracias por llenar mis días de historias que valen la pena contar. Por todo lo que fuimos, por lo que somos y por todo lo bonito que todavía nos falta vivir.',
    wish: 'Que la vida te devuelva toda la luz que tú le das a la mía.',
  },
};
