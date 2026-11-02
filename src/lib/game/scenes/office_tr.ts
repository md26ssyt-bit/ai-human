// 場面「残業の夜の職場」の翻訳（英語・中国語・インドネシア語・スペイン語）。8ターン×2つの役。

import type { SceneDef } from './types';
import { T } from '../text/types';

export const officeTr: SceneDef['tr'] = {
  en: {
    W: [
      T("Good work today. ...You were still here?", "Good work. You must be exhausted, working this late too.", "If you're coming by, overtime isn't so bad.", "Please call me the master of the office.", "I'm up against a deadline. I'm relieved you spoke to me.", "I have work to do.", "Um... is it that late already?"),
      T("I brought you coffee. ...Black is okay, right?", "Thank you. I was just craving some.", "I'll drink anything if you made it.", "Is there affection mixed in to wake me up?", "Thank you for thinking of me. I'll have it.", "No, thanks.", "Hmm, let me think about it."),
      T("Want me to help with the documents? It's a lot for one person.", "Thank you. Then could you take this part?", "If you're helping, please sit next to me.", "No bonus, but plenty of gratitude.", "Honestly, that would help. Please.", "I'll do it myself.", "Um, where should I even start?"),
      T("...It's quiet. An office with just the two of us feels strangely different.", "It does. Everything looks different than usual.", "Being alone with you makes my heart race a little.", "Even if a ghost shows up, it's not scary with two of us.", "I'm reassured to have you here.", "It's quiet, so I'm getting a lot done.", "Oh, the air conditioning shut off."),
      T("You always work so late. ...I worry you're pushing yourself too hard.", "Thank you for worrying. I was a little tired.", "If you're worried, stay closer to me.", "Hard workers run out of battery eventually, huh.", "Honestly, I was pushing myself a bit. Thank you for asking.", "I'm fine.", "That's not true."),
      T("Here, chocolate. ...You need something sweet, too.", "Thank you. I feel like it'll take away my tiredness.", "From you, it seems especially delicious.", "So this is overtime pay, in kind.", "I'm happy. I'll enjoy it carefully.", "I'm not good with sweets.", "What flavor is this?"),
      T("Oh, it's already time for the last train. ...Shall we go to the station together?", "Thank you. Let's go together.", "Maybe I could miss the last train. ...Just kidding.", "Cinderella made the last train.", "I'm reassured to go with you. Please.", "I can go alone.", "Let me gather my things."),
      T("Thank you for today. ...Shall we work overtime together again?", "Yes. Let's do our best together again.", "Next time, let's go to dinner instead of working late.", "Using overtime as a pickup line is quite original.", "I'd like to work with you again, too.", "I'd rather have no overtime.", "Depends on the next deadline."),
    ],
    M: [
      T("Oh, good work. ...You're still here? You startled me.", "Good work. You must be exhausted, working this late.", "With you here, overtime isn't so bad.", "We're both like masters of the office, huh.", "I'm relieved you're here.", "Well, it's work.", "Is it that late already?"),
      T("Hey, this copier jammed again...", "Let me see. Let's fix it together.", "I'll fix it. You take a break.", "Apparently copiers have no love.", "I can't leave you struggling. I'll help.", "Call a repair person.", "Who knows, I don't really know either."),
      T("...It's fixed! Thank you. You saved me.", "I'm glad I could help.", "You can thank me with dinner sometime.", "From today, I'm the copier's dedicated technician.", "I'm really happy it made you happy.", "It was nothing.", "It was just luck."),
      T("Aren't you hungry? I have some snacks. Want some?", "Thank you. I'll have one.", "From you, it seems especially delicious.", "This is overtime pay, in kind.", "Thank you for thinking of me. I'll have some.", "No, thanks.", "May I ask what flavor it is?"),
      T("...It's quiet. An office with just the two of us feels strangely different.", "Yeah. It looks different than usual.", "Being alone together makes my heart race a little.", "Even if a ghost shows up, it's not scary with two of us.", "I'm reassured to have you here.", "It's quiet, so I get more done.", "Oh, the air conditioning shut off."),
      T("You always work so late. ...Aren't you pushing yourself?", "Thank you for worrying. I was a little tired.", "If you're worried, I'd like you to stay closer.", "Hard workers run out of battery eventually.", "Honestly, I was pushing myself a bit. Thank you for asking.", "I'm fine.", "No, not at all."),
      T("Oh, it's time for the last train. ...Can I go to the station with you?", "Of course. Let's go together.", "I'd like to see you to the station.", "Cinderella made the last train.", "I'm glad to go with you. Let's go.", "Do what you like.", "Let me gather my things."),
      T("Thank you for today. ...Let's work overtime together again.", "Of course. Let's do our best together again.", "Next time, let's go to dinner instead of working late.", "Using overtime as a pickup line is quite original.", "I'm looking forward to working with you again.", "I'd rather have no overtime.", "Depends on the next deadline, I guess."),
    ],
  },
  zh: {
    W: [
      T("辛苦了。……你还在啊。", "辛苦了，你这么晚还在忙，一定很累吧。", "有你过来的话，加班也不错。", "请叫我办公室的主人。", "我在赶截止日期，你来搭话我松了口气。", "我还有工作。", "呃……已经这么晚了吗？"),
      T("我煮了咖啡。……黑咖啡可以吗？", "谢谢，我正想喝呢。", "只要是你煮的，什么我都喝。", "提神的咖啡里，也加了爱意吗？", "谢谢你的关心，我收下了。", "不用了。", "怎么办呢……我想想。"),
      T("资料要不要我帮忙？一个人做太多了吧。", "谢谢，那这一部分拜托你。", "要帮忙的话，请坐在我旁边。", "没有奖金，但感谢多得很。", "老实说，这会帮大忙，拜托了。", "我自己来。", "呃，从哪里开始好呢。"),
      T("……好安静。只有我们两个人的办公室，感觉好奇妙。", "是啊，和平时看起来不一样。", "只有我们两个人，我有点心跳加速。", "就算有鬼出现，两个人也不可怕。", "有你在，我很安心。", "安静，工作效率很高。", "啊，空调停了。"),
      T("你总是工作到很晚。……我担心你太勉强自己了。", "谢谢你担心，我是有点累了。", "要是担心的话，就多待在我身边吧。", "勤快的人，总有一天会没电。", "其实我有点勉强了，谢谢你问我。", "我没事。", "没有这回事。"),
      T("给，巧克力。……也需要吃点甜的吧。", "谢谢，感觉疲劳能消除。", "你给的，感觉格外好吃。", "这是加班费的实物发放呢。", "我很开心，我会好好享用。", "我不太喜欢甜的。", "这是什么口味的？"),
      T("啊，已经到末班车的时间了。……我们一起去车站吧？", "谢谢，我们一起去吧。", "错过末班车，也许也不错。……开玩笑的。", "灰姑娘赶上了末班车。", "有你同行我很安心，拜托了。", "我可以一个人去。", "我去收拾东西。"),
      T("今天谢谢你。……我们下次再一起加班吧？", "好，我们再一起加油吧。", "下次不要加班，去吃饭吧。", "把加班当成邀请的话，真新颖。", "我也想再和你一起工作。", "还是不要加班比较好。", "要看下一个截止日期。"),
    ],
    M: [
      T("啊，辛苦了。……你还在啊，吓我一跳。", "辛苦了，你这么晚还在忙，一定很累吧。", "有你在，加班也不错。", "我们俩都像办公室的主人一样呢。", "有你在，我松了口气。", "嗯，这是工作嘛。", "已经这么晚了吗？"),
      T("喂，这台复印机又卡纸了……", "给我看看，我们一起修吧。", "我来修，你休息一下。", "听说复印机是没有爱的。", "你有困难，我不能不管，我来帮忙。", "叫维修人员吧。", "谁知道呢，我也不太懂。"),
      T("……修好了！谢谢，帮大忙了。", "太好了，能帮上忙我很高兴。", "谢礼的话，改天请我吃饭就行。", "从今天起，我就是复印机的专属技师。", "你开心，我真的很高兴。", "没什么。", "只是碰巧而已。"),
      T("你不饿吗？我带了点零食，要不要吃？", "谢谢，我拿一个。", "你给的，感觉格外好吃。", "这是加班费的实物发放呢。", "谢谢你这么体贴，我收下了。", "不用了。", "能问问是什么口味吗？"),
      T("……好安静。只有我们两个人的办公室，感觉好奇妙。", "嗯，和平时看起来不一样。", "只有两个人，我有点心跳加速。", "就算有鬼出现，两个人也不可怕。", "有你在，我很安心。", "安静，效率更高。", "啊，空调停了。"),
      T("你总是工作到很晚。……没有太勉强自己吧？", "谢谢你担心，我是有点累了。", "要是担心的话，希望你多待在我身边。", "勤快的人，总有一天会没电。", "其实我有点勉强了，谢谢你问我。", "没事。", "没有这回事。"),
      T("啊，已经到末班车的时间了。……我可以和你一起去车站吗？", "当然，我们一起去吧。", "我想送你到车站。", "灰姑娘赶上了末班车。", "能同行我很高兴，走吧。", "随你便。", "我去收拾东西。"),
      T("今天谢谢你。……我们下次再一起加班吧。", "当然，我们再一起加油吧。", "下次不要加班，去吃饭吧。", "把加班当成邀请的话，真新颖。", "我很期待再和你一起工作。", "还是不要加班比较好。", "要看下一个截止日期吧。"),
    ],
  },
  id: {
    W: [
      T("Kerja bagus hari ini. ...Kamu masih di sini?", "Kerja bagus. Kamu pasti lelah, lembur sampai selarut ini juga.", "Kalau kamu mampir, lembur tidak terlalu buruk.", "Panggil saja aku penguasa kantor.", "Aku mengejar tenggat. Aku lega kamu menyapaku.", "Aku ada pekerjaan.", "Eh... sudah selarut ini?"),
      T("Aku bawakan kopi. ...Hitam tidak apa-apa, kan?", "Terima kasih. Kebetulan aku ingin minum.", "Apa pun akan kuminum kalau kamu yang membuatnya.", "Apakah ada kasih sayang di dalamnya untuk mengusir kantuk?", "Terima kasih sudah perhatian. Aku minum.", "Tidak usah.", "Bagaimana ya... aku pikirkan dulu."),
      T("Mau kubantu dengan dokumennya? Terlalu banyak kalau dikerjakan sendiri.", "Terima kasih. Kalau begitu, tolong bagian ini.", "Kalau membantu, tolong duduk di sebelahku.", "Tidak ada bonus, tapi rasa terima kasihnya melimpah.", "Jujur, itu sangat membantu. Tolong, ya.", "Aku kerjakan sendiri.", "Eh, mulai dari mana ya?"),
      T("...Sepi sekali. Kantor yang hanya berisi kita berdua terasa aneh.", "Benar. Kelihatan beda dari biasanya.", "Berdua saja begini, jantungku sedikit berdebar.", "Kalau ada hantu pun, berdua tidak menakutkan.", "Aku lega ada kamu di sini.", "Sepi, jadi pekerjaan cepat selesai.", "Oh, AC-nya mati."),
      T("Kamu selalu bekerja sampai larut. ...Aku khawatir kamu memaksakan diri.", "Terima kasih sudah khawatir. Aku memang agak lelah.", "Kalau khawatir, tetaplah lebih dekat denganku.", "Pekerja keras pun akhirnya kehabisan baterai.", "Sebenarnya aku agak memaksakan diri. Terima kasih sudah bertanya.", "Aku baik-baik saja.", "Tidak begitu."),
      T("Ini, cokelat. ...Kamu juga perlu yang manis.", "Terima kasih. Rasanya lelahku akan hilang.", "Dari kamu, kelihatannya terasa istimewa enaknya.", "Jadi ini upah lembur dalam bentuk barang.", "Aku senang. Akan kunikmati pelan-pelan.", "Aku kurang suka yang manis.", "Ini rasa apa?"),
      T("Oh, sudah waktunya kereta terakhir. ...Mau ke stasiun bersama?", "Terima kasih. Ayo pergi bersama.", "Kalau ketinggalan kereta terakhir pun tidak apa-apa. ...Bercanda.", "Cinderella sempat naik kereta terakhir.", "Aku lega pergi bersamamu. Tolong, ya.", "Aku bisa pergi sendiri.", "Aku bereskan barang dulu."),
      T("Terima kasih untuk hari ini. ...Mau lembur bersama lagi?", "Ya. Ayo berjuang bersama lagi.", "Lain kali, ayo makan malam, bukan lembur.", "Memakai lembur sebagai kalimat ajakan, cukup orisinal.", "Aku juga ingin bekerja bersamamu lagi.", "Lebih baik tidak ada lembur.", "Tergantung tenggat berikutnya."),
    ],
    M: [
      T("Oh, kerja bagus. ...Kamu masih di sini? Aku kaget.", "Kerja bagus. Kamu pasti lelah, lembur sampai selarut ini.", "Kalau ada kamu, lembur tidak terlalu buruk.", "Kita berdua seperti penguasa kantor, ya.", "Aku lega ada kamu.", "Ya, namanya juga kerja.", "Sudah selarut ini?"),
      T("Hei, mesin fotokopi ini macet lagi...", "Coba kulihat. Ayo kita perbaiki bersama.", "Biar aku yang perbaiki. Kamu istirahat saja.", "Katanya mesin fotokopi tidak punya cinta.", "Aku tidak bisa membiarkanmu kesusahan. Aku bantu.", "Panggil teknisi saja.", "Entahlah, aku juga kurang paham."),
      T("...Sudah beres! Terima kasih. Kamu menolongku.", "Syukurlah bisa membantu.", "Terima kasihnya cukup dengan makan malam kapan-kapan.", "Mulai hari ini, aku teknisi khusus mesin fotokopi.", "Aku sungguh senang kamu senang.", "Bukan apa-apa.", "Hanya kebetulan."),
      T("Kamu tidak lapar? Aku bawa camilan. Mau?", "Terima kasih. Aku ambil satu.", "Dari kamu, kelihatannya terasa istimewa enaknya.", "Ini upah lembur dalam bentuk barang.", "Terima kasih sudah perhatian. Aku coba.", "Tidak usah.", "Boleh tahu rasanya apa?"),
      T("...Sepi sekali. Kantor yang hanya berisi kita berdua terasa aneh.", "Iya. Kelihatan beda dari biasanya.", "Berdua saja begini, jantungku sedikit berdebar.", "Kalau ada hantu pun, berdua tidak menakutkan.", "Aku lega ada kamu di sini.", "Sepi, jadi lebih produktif.", "Oh, AC-nya mati."),
      T("Kamu selalu bekerja sampai larut. ...Tidak memaksakan diri?", "Terima kasih sudah khawatir. Aku memang agak lelah.", "Kalau khawatir, aku ingin kamu tetap lebih dekat.", "Pekerja keras pun akhirnya kehabisan baterai.", "Sebenarnya aku agak memaksakan diri. Terima kasih sudah bertanya.", "Aku baik-baik saja.", "Tidak begitu."),
      T("Oh, sudah waktunya kereta terakhir. ...Boleh aku ke stasiun bersamamu?", "Tentu. Ayo pergi bersama.", "Aku ingin mengantarmu sampai stasiun.", "Cinderella sempat naik kereta terakhir.", "Aku senang pergi bersamamu. Ayo.", "Terserah kamu.", "Aku bereskan barang dulu."),
      T("Terima kasih untuk hari ini. ...Mari lembur bersama lagi.", "Tentu. Ayo berjuang bersama lagi.", "Lain kali, ayo makan malam, bukan lembur.", "Memakai lembur sebagai kalimat ajakan, cukup orisinal.", "Aku menantikan bekerja bersamamu lagi.", "Lebih baik tidak ada lembur.", "Tergantung tenggat berikutnya, ya."),
    ],
  },
  es: {
    W: [
      T("Buen trabajo hoy. ...¿Todavía estabas aquí?", "Buen trabajo. Debes de estar agotado, trabajando tan tarde.", "Si vienes tú, hacer horas extra no está tan mal.", "Llámame el amo de la oficina.", "Tengo una fecha límite. Me alivia que me hables.", "Tengo trabajo.", "Eh... ¿ya es tan tarde?"),
      T("Te traje café. ...Negro está bien, ¿verdad?", "Gracias. Justo me apetecía.", "Me tomo lo que sea, si lo preparaste tú.", "¿Le pusiste cariño para espantar el sueño?", "Gracias por pensar en mí. Lo tomo.", "No, gracias.", "Mmm, déjame pensarlo."),
      T("¿Te ayudo con los documentos? Son muchos para una sola persona.", "Gracias. Entonces encárgate de esta parte, por favor.", "Si me ayudas, siéntate a mi lado.", "No hay bono, pero sí un montón de gratitud.", "La verdad, me vendría muy bien. Por favor.", "Lo hago yo.", "Eh, ¿por dónde empiezo?"),
      T("...Qué silencio. Una oficina solo para los dos se siente extraña.", "Sí. Se ve distinta de lo habitual.", "Estando a solas contigo, el corazón me late un poco más rápido.", "Aunque apareciera un fantasma, entre dos no da miedo.", "Me tranquiliza tenerte aquí.", "Hay silencio, así que avanzo mucho.", "Ah, se apagó el aire acondicionado."),
      T("Siempre trabajas hasta tarde. ...Me preocupa que te estés esforzando demasiado.", "Gracias por preocuparte. Estaba un poco cansada.", "Si te preocupa, quédate más cerca de mí.", "Los trabajadores incansables también se quedan sin batería.", "La verdad, me estaba forzando un poco. Gracias por preguntar.", "Estoy bien.", "No es verdad."),
      T("Toma, chocolate. ...También necesitas algo dulce.", "Gracias. Creo que me quitará el cansancio.", "Viniendo de ti, parece especialmente rico.", "Esto es el pago de horas extra, en especie.", "Me alegro. Lo disfrutaré con calma.", "No soy muy de dulces.", "¿De qué sabor es?"),
      T("Ah, ya es la hora del último tren. ...¿Vamos juntos a la estación?", "Gracias. Vamos juntos.", "Quizá podría perder el último tren. ...Es broma.", "Cenicienta alcanzó el último tren.", "Me tranquiliza ir contigo. Por favor.", "Puedo ir sola.", "Voy a recoger mis cosas."),
      T("Gracias por hoy. ...¿Hacemos horas extra juntos otra vez?", "Sí. Esforcémonos juntos otra vez.", "La próxima vez, vayamos a cenar en vez de quedarnos a trabajar.", "Usar las horas extra como frase para invitar es bastante original.", "Yo también quiero volver a trabajar contigo.", "Prefiero no hacer horas extra.", "Dependerá de la próxima fecha límite."),
    ],
    M: [
      T("Ah, buen trabajo. ...¿Todavía estabas aquí? Me asustaste.", "Buen trabajo. Debes de estar agotada, trabajando tan tarde.", "Contigo aquí, las horas extra no están tan mal.", "Los dos parecemos los amos de la oficina.", "Me alivia que estés aquí.", "Bueno, es trabajo.", "¿Ya es tan tarde?"),
      T("Oye, esta fotocopiadora se atascó otra vez...", "Déjame ver. Arreglémosla juntos.", "La arreglo yo. Tú descansa.", "Parece que las fotocopiadoras no tienen amor.", "No puedo dejarte con el problema. Te ayudo.", "Llama a un técnico.", "Quién sabe, yo tampoco entiendo mucho."),
      T("...¡Ya funciona! Gracias. Me salvaste.", "Me alegra haber ayudado.", "Con una cena algún día me lo agradeces.", "Desde hoy, soy el técnico exclusivo de la fotocopiadora.", "De verdad me alegra que te alegres.", "No fue nada.", "Fue pura suerte."),
      T("¿No tienes hambre? Tengo unas golosinas. ¿Quieres?", "Gracias. Tomo una.", "Viniendo de ti, parece especialmente rico.", "Esto es el pago de horas extra, en especie.", "Gracias por pensar en mí. Probaré.", "No, gracias.", "¿Puedo preguntar de qué sabor es?"),
      T("...Qué silencio. Una oficina solo para los dos se siente extraña.", "Sí. Se ve distinta de lo habitual.", "Estando solos, el corazón me late un poco más rápido.", "Aunque apareciera un fantasma, entre dos no da miedo.", "Me tranquiliza tenerte aquí.", "Hay silencio, así que rindo más.", "Ah, se apagó el aire acondicionado."),
      T("Siempre trabajas hasta tarde. ...¿No te estás forzando?", "Gracias por preocuparte. Estaba un poco cansado.", "Si te preocupa, quisiera que te quedaras más cerca.", "Los trabajadores incansables también se quedan sin batería.", "La verdad, me estaba forzando un poco. Gracias por preguntar.", "Estoy bien.", "No es verdad."),
      T("Ah, es la hora del último tren. ...¿Puedo ir contigo a la estación?", "Por supuesto. Vamos juntos.", "Quisiera acompañarte hasta la estación.", "Cenicienta alcanzó el último tren.", "Me alegra ir contigo. Vamos.", "Haz lo que quieras.", "Voy a recoger mis cosas."),
      T("Gracias por hoy. ...Hagamos horas extra juntos otra vez.", "Por supuesto. Esforcémonos juntos otra vez.", "La próxima vez, vayamos a cenar en vez de quedarnos a trabajar.", "Usar las horas extra como frase para invitar es bastante original.", "Tengo ganas de volver a trabajar contigo.", "Prefiero no hacer horas extra.", "Dependerá de la próxima fecha límite, supongo."),
    ],
  },
};