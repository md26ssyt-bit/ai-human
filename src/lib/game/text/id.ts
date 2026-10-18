import { R, T } from './types';
import type { GameText } from './types';
 
const id: GameText = {
  turns: {
    W: [
      T("Capek ya hari ini. ...Kamu nggak bawa payung?", "Iya, lupa bawa. Makasih sudah menyapa.", "Nggak bawa. ...Boleh aku ikut payungmu?", "Ramalan cuacanya mengkhianatiku.", "Jujur, aku lagi kesulitan. Terima kasih.", "Nggak apa-apa. Aku lari saja.", "Hmm... entahlah."),
      T("Jalanku terlalu cepat, ya? Aku ikuti langkahmu.", "Makasih. Pelan-pelan lebih enak.", "Kalau begitu, jalan lebih dekat denganku.", "Tadi aku mirip atlet jalan cepat, ya.", "Senang kamu memperhatikan. Sudah pas kok.", "Aku juga nggak buru-buru.", "Entahlah. Mungkin gara-gara hujan."),
      T("Eh, bahumu basah. Geser sedikit ke sini.", "Kamu juga basah. Kita bagi dua saja.", "...Kalau begitu, aku nggak sungkan, ya.", "Berbagi payung ternyata butuh keahlian.", "Terima kasih. Aku jadi tenang.", "Nggak apa-apa. Aku lebih nyaman agak jauh.", "Hujannya makin deras."),
      T("Kamu selalu kerja keras, ya. Aku kagum.", "Kamu memperhatikan, ya? Aku senang.", "Boleh kok memujiku lebih banyak.", "Bisa nggak itu masuk ke gajiku?", "Terima kasih. Itu menyemangatiku.", "...Itu kan memang pekerjaanku.", "Ah, nggak juga."),
      T("...Suara hujan menenangkan, ya.", "Iya. Tenang dan enak.", "Mendengarnya berdua begini, nggak buruk juga.", "Suara hujan jadi musik latar. Mewah sekali.", "Aku merasa tenang kalau bersamamu.", "Itu cuma hujan.", "Lampunya belum berubah juga."),
      T("Nggak dingin? Mau kubelikan minuman hangat?", "Makasih. Cokelat panas kayaknya enak.", "Ayo kita beli bareng.", "Kalau begitu, yang paling mahal ya.", "Terima kasih sudah perhatian. Tolong ya.", "Nggak usah.", "Hmm, aku bingung."),
      T("Stasiunnya sudah dekat. ...Bawa saja payung ini pulang.", "Makasih. Tapi nanti kamu kebasahan. Kita ke stasiun bareng saja.", "Kalau begitu aku akan mengembalikannya, jadi kita bertemu lagi, ya.", "Jadi sandera, ya? Pasti kukembalikan.", "Terima kasih. Akan kujaga baik-baik.", "Nggak perlu.", "...Biar aku pikir dulu."),
      T("Terima kasih untuk hari ini. ...Boleh pulang bareng lagi?", "Iya. Ayo pulang bareng lagi.", "Lain kali, bukan cuma pulang, tapi makan juga.", "Lain kali payungnya harus reservasi dulu.", "Aku juga ingin pulang bersamamu lagi.", "Kalau lagi mood.", "Tergantung cuaca besok."),
    ],
    M: [
      T("Ah... payungku ketinggalan. Gimana ya?", "Kalau mau, ikut payungku. Aku antar sampai stasiun.", "Masuk ke payungku. Kita ke stasiun bareng.", "Pas sekali. Payung ini ukuran dua orang.", "Aku nggak tega membiarkanmu kehujanan. Ayo bareng.", "Nih, pakai ini.", "Hujannya deras. Gimana ya?"),
      T("Maaf ya, apa aku merepotkan?", "Sama sekali nggak. Jangan dipikirkan.", "Malah aku senang bisa membantu.", "Biaya repotnya, nanti traktir kopi satu.", "Aku nggak merasa direpotkan. Sungguh.", "Nggak. Sekalian lewat.", "Entahlah."),
      T("...Bahumu basah. Aku nggak apa-apa kok.", "Nggak apa-apa. Aku lebih suka kamu nggak basah.", "Kalau begitu begini saja. (memiringkan payung ke arahnya)", "Bahuku anti air.", "Aku lebih khawatir kalau kamu yang basah.", "Aku baik-baik saja.", "Ngomong-ngomong, kamu sering lewat sini?"),
      T("Kamu selalu memperhatikan orang di sekitar. Sangat membantu.", "Aku senang kalau diandalkan.", "Aku paling memperhatikanmu.", "Aku cukup bangga dengan daya amatku.", "Mendengar itu, rasanya terbayar.", "Aku cuma melakukan hal biasa.", "Aku nggak terlalu memperhatikan kok."),
      T("...Suara hujannya tenang dan enak.", "Iya. Hati jadi tenang.", "Aku suka berada di sini bersamamu begini.", "Ini mirip kencan, ya?", "Bersamamu, diam pun terasa nyaman.", "Iya.", "Lampu merahnya lama banget."),
      T("Agak dingin, ya. Pengin minum yang hangat.", "Aku belikan. Tunggu di sini.", "Ayo minum bareng. Ada tempat bagus di dekat sini.", "Kalau begitu, siapa yang traktir kita tentukan dengan suit.", "Kedinginan itu nggak baik. Ayo menghangatkan diri.", "Jangan sampai masuk angin.", "Enaknya apa, ya."),
      T("Ah, stasiun. ...Terima kasih payungnya. Kamu menyelamatkanku.", "Sama-sama. Hati-hati jangan masuk angin.", "Bisakah kita bertemu lagi?", "Biaya pemakaiannya kutagih lain kali.", "Syukurlah bisa membantu.", "Nggak apa-apa. Sampai nanti.", "Mungkin, suatu hari nanti."),
      T("Terima kasih untuk hari ini. ...Kita bisa ngobrol lagi?", "Tentu. Sapa aku kapan saja.", "Lain kali aku yang mengajak. Ayo makan.", "Lain kali, hari yang cerah ya.", "Aku senang bisa ngobrol denganmu. Ayo ngobrol lagi.", "Ya, kalau ada kesempatan.", "Entahlah. Besok juga ketahuan."),
    ],
  },
  reactions: {
    W: {
      tsundere: R("A-aku nggak senang kok... tapi nggak buruk juga.", "...Begitu. Ya sudah, boleh.", "...Apa-apaan itu?"),
      cool: R("...Terima kasih. Aku senang mendengarnya.", "Begitu.", "...Begitu. Mengerti."),
      tennen: R("Eh, benarkah? Aku senang banget!", "Oh, begitu ya?", "Lho... apa aku salah bicara?"),
      senpai: R("Hehe, senang mendengarnya.", "Begitu. Bisa juga dipikirkan seperti itu.", "...Nggak perlu memaksakan diri."),
      genki: R("Yes! Senang banget!", "Oh, oke! Hmm-hm!", "Yaah, kok begitu..."),
      shy: R("Oh... terima kasih. ...Aku senang.", "O-oh, begitu.", "Oh... m-maaf."),
    },
    M: {
      tsundere: R("A-aku nggak senang kok... tapi mungkin nggak buruk.", "...Hmm. Ya sudah, boleh.", "...Apa itu? Nggak percaya."),
      cool: R("...Terima kasih. Aku senang.", "Begitu.", "...Begitu. Aku mengerti."),
      tennen: R("Wah, benarkah? Senang banget!", "Oh, begitu ya?", "Lho? Aku bilang yang aneh, ya?"),
      senpai: R("Hehe, kamu pandai bicara, ya.", "Begitu rupanya.", "...Nggak perlu memaksakan diri, lho."),
      genki: R("Yeay! Senang banget!", "Oh, oke! Hmm-hm!", "Yaah, jahat banget..."),
      shy: R("Oh... terima kasih. Aku senang.", "O-oh, begitu.", "Oh... maaf."),
    },
  },
  rejectLine: "Maaf, sampai di sini saja untuk hari ini.",
  friendLine: "Terima kasih untuk hari ini. ...Kita berteman saja, ya.",
  archetype: { tsundere: 'Tipe tsundere', cool: 'Tipe cool', tennen: 'Tipe polos', senpai: 'Tipe senior yang bisa diandalkan', genki: 'Tipe ceria', shy: 'Tipe pemalu' },
};
export default id;
 