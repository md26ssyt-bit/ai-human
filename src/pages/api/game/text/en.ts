import { R, T } from './types';
import type { GameText } from './types';
 
const en: GameText = {
  turns: {
    W: [
      T("Good work today. ...You don't have an umbrella?", "No, I forgot mine. Thank you for asking.", "I don't. ...Will you let me share yours?", "The weather forecast betrayed me.", "Honestly, I was in trouble. Thank you.", "I'm fine. I'll just run.", "Um... who knows?"),
      T("Am I walking too fast? I'll match your pace.", "Thank you. A slower pace helps.", "Then walk a little closer to me.", "I guess I was race-walking.", "I'm glad you noticed. It's just right.", "I'm not in a hurry anyway.", "Who knows? Maybe it's the rain."),
      T("Your shoulder's getting wet. Come a little closer.", "You're getting wet too. Let's share it evenly.", "...Then I won't hold back.", "Sharing an umbrella takes real skill, huh.", "Thank you. That puts me at ease.", "I'm fine. I like some distance.", "The rain's getting heavier."),
      T("You always work so hard. I'm impressed.", "You were watching? That makes me happy.", "You can praise me more, you know.", "Can that be reflected in my paycheck?", "Thank you. That really encourages me.", "...It's just my job.", "It's nothing, really."),
      T("...The sound of the rain is calming.", "Yes. It's quiet and nice.", "Listening to it together like this isn't bad.", "Rain as background music. What a luxury.", "I feel calm when I'm with you.", "It's just rain.", "The light still hasn't changed."),
      T("Aren't you cold? Shall I buy us something warm to drink?", "Thank you. Hot cocoa sounds great.", "Let's go buy it together.", "Then I'll take the most expensive one.", "Thank you for thinking of me. Yes, please.", "No thanks.", "Hmm, I can't decide."),
      T("We're almost at the station. ...Please, take this umbrella home.", "Thank you. But you'd get soaked. Let's go to the station together.", "Then I'll return it, so let's meet again.", "A hostage, huh? I'll return it properly.", "Thank you. I'll take good care of it.", "I don't need it.", "...Let me think about it."),
      T("Thank you for today. ...Can we walk home together again?", "Yes. Let's walk home together again.", "Next time, let's get dinner, not just walk home.", "Umbrella reservations only, next time, please.", "I'd like to walk home with you again, too.", "If I feel like it.", "That depends on tomorrow's weather."),
    ],
    M: [
      T("Oh... I forgot my umbrella. What should I do?", "If you like, come under mine. I'll see you to the station.", "Come under my umbrella. Let's go to the station together.", "Perfect timing. This umbrella is a two-person model.", "I can't leave you in the rain. Let's go together.", "Here, take this.", "It's pouring. What should we do?"),
      T("Sorry. Am I being a bother?", "Not at all. Don't worry about it.", "I'm actually glad I could help.", "The bother fee is one coffee, later.", "I don't think of it as a bother. Really.", "No. It's on my way.", "Who knows?"),
      T("...Your shoulder is getting wet. I'm fine, really.", "It's okay. I'd rather you stay dry.", "Then let's do this. (tilts the umbrella toward her)", "My shoulders are waterproof.", "I'd worry more if you got wet.", "I'm fine.", "By the way, do you come this way often?"),
      T("You always look out for everyone. It really helps.", "I'm happy when people rely on me.", "I look out for you most of all.", "I'm quite proud of my powers of observation.", "It means a lot to hear that.", "I'm just doing the normal thing.", "I don't really watch that much."),
      T("...The sound of the rain is nice and quiet.", "Yes. It calms the heart.", "I like being here with you like this.", "This is kind of like a date, isn't it?", "With you, even silence feels comfortable.", "Yeah.", "This light takes forever."),
      T("It's a bit cold. I could use something warm to drink.", "I'll get something. Wait here.", "Let's have one together. I know a good place nearby.", "Then let's play rock-paper-scissors to see who treats.", "Getting chilled isn't good. Let's warm up.", "Don't catch a cold.", "What would be good, I wonder."),
      T("Oh, the station. ...Thank you for the umbrella. You saved me.", "You're welcome. Take care not to catch a cold.", "Will I get to see you again?", "I'll bill you a usage fee next time.", "I'm glad I could help.", "It's nothing. See you.", "Maybe, someday."),
      T("Thank you for today. ...Can we talk again?", "Of course. Talk to me anytime.", "Next time, I'll invite you. Let's get dinner.", "Next time, a sunny day, please.", "I was glad to talk with you. Let's talk again.", "Well, if there's a chance.", "Who knows? We'll find out tomorrow."),
    ],
  },
  reactions: {
    W: {
      tsundere: R("I'm not happy or anything... but that's not bad.", "...I see. Well, fine.", "...What's that supposed to mean?"),
      cool: R("...Thank you. I'm glad to hear that.", "I see.", "...I see. Understood."),
      tennen: R("Really? That makes me so happy!", "Oh, is that so?", "Huh... did I say something wrong?"),
      senpai: R("Heh, that makes me happy.", "I see. That's one way to look at it.", "...You don't have to force yourself."),
      genki: R("Yes! I'm so happy!", "Oh, okay! Mm-hm!", "Aww, come on..."),
      shy: R("Oh... thank you. ...I'm happy.", "I-I see.", "Oh... s-sorry."),
    },
    M: {
      tsundere: R("I'm not happy or anything... but maybe it's not bad.", "...Hmm. Well, fine.", "...What is that? I can't believe you."),
      cool: R("...Thank you. I'm glad.", "I see.", "...I see. Got it."),
      tennen: R("Wow, really? I'm so happy!", "Oh, is that so?", "Huh? Did I say something strange?"),
      senpai: R("Heh, what a lovely thing to say.", "I see. Is that so.", "...You don't have to force yourself."),
      genki: R("Yay! I'm sooo happy!", "Oh, okay! Mm-hm!", "Aww, that's mean..."),
      shy: R("Oh... thank you. I'm happy.", "O-oh, I see.", "Oh... I'm sorry."),
    },
  },
  rejectLine: "I'm sorry. Let's call it a day.",
  friendLine: "Thank you for today. ...Let's stay friends.",
  archetype: { tsundere: 'Tsundere type', cool: 'Cool type', tennen: 'Dreamy type', senpai: 'Dependable older type', genki: 'Energetic type', shy: 'Shy type' },
};
export default en;
 