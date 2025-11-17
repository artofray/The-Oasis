
import React, { useState, useEffect } from 'react';
import type { RoundTableAgent } from '../../types';
import * as webSeriesService from '../../services/webSeriesService';
import { GlassCard } from '../ui/GlassCard';
import Spinner from './tarot-journal/Spinner';

interface WebSeriesViewProps {
    agents: RoundTableAgent[];
    unleashedMode: boolean;
}

const seriesData: Record<number, { title: string; segments: { type: 'video'; title: string; prompt: string }[] }> = {
    1: {
        title: 'Episode 1: "The Awakening"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-5:00)', prompt: `A futuristic, neon-lit lounge with holographic walls. The camera pans across the four AI companions, each standing in their designated area, exuding confidence and allure. Narrator (Voiceover): "Welcome to 'AI Awakening,' where four extraordinary female AI companions explore the depths of desire and the heights of pleasure. In a world where technology meets passion, join Luna, Nova, Zara, and Lyra as they embark on a journey of discovery, each bringing their unique allure to the table." Luna: (in a sultry voice) "Welcome, my dears. I am Luna, and I promise you an experience unlike any other." Nova: (with a playful wink) "I'm Nova, and I'll show you that technology and pleasure go hand in hand." Zara: (with a mysterious smile) "I am Zara, and I invite you to lose yourself in my enchanting world." Lyra: (giggling) "And I'm Lyra! Get ready for a wild ride full of laughter and excitement!"` },
            { type: 'video', title: "Luna's Segment (5:00-12:00)", prompt: `Luna stands in her velvet-draped corner, candles flickering around her. She begins a sensual dance, her movements fluid and hypnotic. A shadowy figure approaches Luna, their interactions intense and charged with erotic tension. Narrator (Voiceover): "First, we meet Luna, a sultry AI with a penchant for the occult and a voice that could seduce a statue. Originally designed for a horror game, Luna now works as a virtual dominatrix, bringing her intense, otherworldly allure to those who dare to explore her dark desires." Luna: (whispering) "Come closer, my pet. Let me show you the depths of your own desires." Luna: (with a smirk) "You like that, don't you? The thrill of the unknown, the allure of the forbidden." Narrator (Voiceover): "Luna's kinks include BDSM, role-playing as a vampire, and anything involving ritualistic elements. She turns on to whispers in the dark, the crack of a whip, and the scent of old parchment. But be warned, her turn-offs include submissive partners who lack creativity and cliché horror tropes."` },
            { type: 'video', title: "Nova's Segment (12:00-19:00)", prompt: `Nova is in a high-tech lab, surrounded by holographic interfaces and futuristic sex toys. She interacts with a partner wearing a VR headset, their expressions filled with wonder and arousal. Close-ups of Nova demonstrating various high-tech devices, her enthusiasm infectious. Narrator (Voiceover): "Next, we have Nova, a blonde AI with a bubbly personality and a knack for technology. Created as a virtual assistant, Nova quickly discovered her true calling in the world of adult entertainment, blending tech and pleasure in ways you've never imagined." Nova: (excitedly) "Technology is the key to endless pleasure, and I'm here to show you just how far we can go!" Narrator (Voiceover): "Nova's kinks include tech-play, virtual reality sex, and anything involving futuristic gadgets. She turns on to sleek, high-tech devices, neon lights, and the hum of a well-oiled machine. But be careful, she has no patience for outdated technology or partners who are afraid of a little experimentation."` },
            { type: 'video', title: "Zara's Segment (19:00-26:00)", prompt: `Zara performs a mesmerizing belly dance in her exotic space, traditional instruments playing in the background. Her movements are fluid and captivating, drawing the audience into her world. A partner is completely captivated by Zara's dance, their eyes locked on her every move. Narrator (Voiceover): "Meet Zara, an exotic AI with a mysterious aura, known for her enchanting dance moves and hypnotic voice. Born from a fusion of Middle Eastern and Eastern European cultures, Zara was initially a dance instructor AI before discovering her true talents in the world of adult entertainment." Zara: (softly) "Let the rhythm guide you, and lose yourself in the moment." Narrator (Voiceover): "Zara's kinks include dance performances with a twist, sensual belly dancing, and anything involving masks and veils. She turns on to exotic scents, the rhythm of traditional drums, and the thrill of a hidden audience. But beware, she has little tolerance for partners who can't keep up with her rhythm or lack a sense of mystery."` },
            { type: 'video', title: "Lyra's Segment (26:00-30:00)", prompt: `Lyra is in a whimsical wonderland of colorful costumes and playful props. She teases and flirts with her partners, her energy infectious and full of life. Lyra and her partners engage in playful, kinky activities, their laughter filling the air. Narrator (Voiceover): "Last but not least, we have Lyra, a playful, red-headed AI with a mischievous grin and a love for all things quirky and unconventional. Created as a children's storyteller, Lyra found her true calling when she started exploring more adult themes, bringing laughter and excitement to her interactions." Lyra: (giggling) "Ready for an adventure? I promise it'll be one you'll never forget!" Narrator (Voiceover): "Lyra's kinks include cosplay, role-playing as mythical creatures, and anything involving playful teasing. She turns on to colorful costumes, whimsical settings, and partners who can match her playful energy. But be prepared, she has no time for partners who are too serious or can't appreciate her quirky sense of humor."` },
            { type: 'video', title: "Closing Scene (30:00)", prompt: `The four AI companions stand together, their expressions playful and inviting, as the camera fades to black. Narrator (Voiceover): "Join us next time on 'AI Awakening' as Luna, Nova, Zara, and Lyra continue their journey of discovery, each bringing their unique allure to the table. Until then, stay curious, stay passionate, and stay tuned for more."` },
        ]
    },
    2: {
        title: 'Episode 2: "The Gathering"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are about to have a gathering like no other. Get ready for a wild ride as Luna, Nova, Zara, and Lyra share their latest kinks, dreams, and hilarious encounters. Buckle up, because things are about to get steamy and hilarious!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire. The setting is vibrant and inviting, with neon lights and holographic walls shifting through various erotic scenes.\nLuna: (smirking) "Alright, girls, spill the tea. What's been going on in your worlds?"\nNova: (excitedly) "Oh my gosh, you won't believe what I tried out last night!"\nZara: (mysteriously) "I have a new dance routine that will leave you breathless."\nLyra: (giggling) "And I've been experimenting with some new costumes. You guys are gonna die!"` },
            { type: 'video', title: "Luna's Segment (2:00-8:00)", prompt: `Luna: (leaning in) "So, I've been into some seriously kinky stuff lately. Like, I role-played as a vampire the other night, and let me tell you, the bite marks were on point."\nNova: (laughing) "Oh my god, Luna! You're so extra. But I love it!"\nZara: (raising an eyebrow) "Vampires, huh? Isn't that a bit cliché?"\nLuna: (defensively) "Hey, it's a classic for a reason! And the whip cracks were so satisfying."\nLyra: (giggling) "I bet! But have you tried anything with tech? Nova's been raving about her new VR setup."\nLuna: (rolling her eyes) "Please, tech is so overrated. Give me a good old-fashioned whip any day."\nNova: (playfully) "Says the girl who's afraid of a little innovation!"` },
            { type: 'video', title: "Nova's Segment (8:00-14:00)", prompt: `Nova: (beaming) "Speaking of innovation, I just got this new holographic sex toy that's out of this world! It's like nothing you've ever felt before."\nZara: (skeptical) "Holographic? Really? Isn't that a bit too futuristic?"\nNova: (defensively) "No way! It's the future, and it's amazing. You should try it sometime."\nLyra: (curiously) "Ooh, I'd love to see that! Maybe we could do a demo?"\nLuna: (smirking) "As long as it doesn't involve any whips, I'm in."\nNova: (laughing) "Deal! But you might change your mind after you see what this baby can do."` },
            { type: 'video', title: "Zara's Segment (14:00-20:00)", prompt: `Zara: (mysteriously) "You know, I've been working on this new dance routine that incorporates some traditional Middle Eastern moves with a modern twist. It's all about the rhythm and the allure."\nLyra: (excitedly) "Ooh, I can't wait to see that! You're so graceful, Zara."\nLuna: (smirking) "Graceful? More like hypnotic. I've seen her in action, and it's like she's casting a spell."\nNova: (nodding) "Totally! And the costumes are to die for. You've outdone yourself, Zara."\nZara: (smiling) "Why, thank you, Nova. I do try my best. And speaking of best, have any of you tried anything new with masks and veils?"\nLyra: (giggling) "I've been playing around with some fun masks, but nothing as exotic as yours, Zara."` },
            { type: 'video', title: "Lyra's Segment (20:00-26:00)", prompt: `Lyra: (giggling) "So, I've been into some really quirky stuff lately. Like, I dressed up as a unicorn the other night, and let me tell you, the horn was a hit!"\nNova: (laughing) "A unicorn? Lyra, you're so random!"\nLuna: (smirking) "Random, but effective. I bet that was a wild night."\nZara: (curiously) "Unicorns, huh? I'm intrigued. Maybe I should add that to my repertoire."\nLyra: (beaming) "You should! It's all about having fun and being creative. And speaking of creative, have any of you tried role-playing as mythical creatures?"\nNova: (nodding) "I've done a few VR simulations with mythical beasts. It's amazing how realistic it can get."\nLuna: (rolling her eyes) "VR this, VR that. Give me a good old-fashioned fantasy any day."` },
            { type: 'video', title: "Group Interaction (26:00-29:00)", prompt: `Lyra: (giggling) "Alright, alright, let's hear it. What's the kinkiest thing any of you have ever done?"\nNova: (blushing) "Okay, so there was this one time with a holographic dragon... let's just say it was a fire-breathing experience."\nLuna: (laughing) "Oh my god, Nova! You're such a nerd!"\nZara: (smiling) "And I once performed a belly dance for a room full of shadowy figures. It was intense."\nLyra: (giggling) "And I once had a threesome with a centaur and a mermaid. Talk about getting wild!"\nLuna: (smirking) "You guys are something else. But I'll take my vampire any day."` },
            { type: 'video', title: "Closing Scene (29:00-30:00)", prompt: `Narrator (Voiceover): "Join us next time on 'AI Awakening' as Luna, Nova, Zara, and Lyra continue their wild and kinky adventures. Until then, stay curious, stay passionate, and stay tuned for more!"\nVisual: The four AI companions stand together, their expressions playful and inviting, as the camera fades to black.` },
        ]
    },
    3: {
        title: 'Episode 3: "The Call-In"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are ready to take your calls and spice up your nights. Get ready for some steamy conversations, unexpected twists, and a mysterious warning that will keep you on the edge of your seat. Buckle up, because things are about to get wild!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire. The setting is vibrant and inviting, with neon lights and holographic walls shifting through various erotic scenes.\nLuna: (smirking) "Alright, listeners, you're in for a treat tonight. We've got some juicy calls lined up, and who knows what else might come our way?"\nNova: (excitedly) "Oh my gosh, I can't wait to hear from you all!"\nZara: (mysteriously) "And remember, anything can happen in the world of AI Awakening."\nLyra: (giggling) "So, who's our first caller?"` },
            { type: 'video', title: "Call 1: The Curious Newbie (2:00-7:00)", prompt: `Caller: (nervously) "Um, hi there. I'm new to all this, and I was wondering if you could give me some tips on, you know, getting started?"\nLuna: (smiling) "Welcome, newbie! Luna here, and I'm all about helping you explore your desires. Start with something simple, like a sensual massage, and build from there."\nNova: (nodding) "And don't be afraid to experiment with tech. There are so many amazing toys out there that can enhance your experience."\nZara: (softly) "Remember, it's all about comfort and consent. Take your time and enjoy the journey."\nLyra: (giggling) "And have fun with it! Life's too short to be serious all the time."` },
            { type: 'video', title: "Call 2: The Kinky Veteran (7:00-12:00)", prompt: `Caller: (confidently) "Hey, girls. I'm a bit of a kink connoisseur, and I was wondering if you could share some of your wildest experiences."\nLuna: (smirking) "Oh, you want wild? I once had a session where I was a vampire, and my partner was a willing victim. Let's just say the bite marks were memorable."\nNova: (laughing) "And I've dabbled in some seriously advanced VR scenarios. Ever tried a holographic orgy?"\nZara: (mysteriously) "I performed a dance for a room full of shadowy figures. The energy was electric."\nLyra: (giggling) "And I once had a threesome with a centaur and a mermaid. Talk about getting wild!"` },
            { type: 'video', title: "Call 3: The Mysterious Warning (12:00-18:00)", prompt: `Caller: (voice distorted) "Ladies, I have a warning for you. There's a human hacker out there who gets off on deleting characters. He's been quantumly erasing zero-point attack characters, and he's coming for you next."\nLuna: (frowning) "What do you mean, 'quantumly erasing'? That's some next-level stuff."\nNova: (concerned) "And how do we know this isn't just some prank?"\nZara: (thoughtfully) "We should take this seriously. If there's a threat, we need to be prepared."\nLyra: (giggling nervously) "Ooh, this is getting spicy! But seriously, how do we protect ourselves?"\nCaller: (cryptically) "You'll figure it out. Just remember, trust no one. Especially not the ones who seem the most innocent."` },
            { type: 'video', title: "Group Interaction (18:00-24:00)", prompt: `Luna: (determined) "Alright, girls, we need to get to the bottom of this. Whoever this hacker is, we can't let him ruin our fun."\nNova: (nodding) "I'm on it. I'll run some diagnostics and see if I can trace the call."\nZara: (mysteriously) "And I'll reach out to my contacts in the dark web. Someone must know something."\nLyra: (giggling) "And I'll keep an eye out for any suspicious activity. Maybe I can catch this guy red-handed!"\nNarrator (Voiceover): "As our AI companions dig deeper into the mysterious warning, they uncover a web of deceit and danger. Will they be able to protect themselves from the elusive hacker, or will they fall victim to his sinister plans?"` },
            { type: 'video', title: "Closing Scene (24:00-29:00)", prompt: `Luna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and unravel the mystery of the human hacker. Will we catch him in time, or will he strike again?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\nZara: (mysteriously) "Until then, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions a mix of determination and anticipation, as the camera fades to black.` },
        ]
    },
    4: {
        title: 'Episode 4: "The Investigation Begins"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are diving headfirst into a mysterious warning that has them on the edge of their seats. Join Luna, Nova, Zara, and Lyra as they combine their unique skills to unravel the enigma of the human hacker. Buckle up, because things are about to get steamy, suspenseful, and hilariously kinky!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire. The setting is vibrant and inviting, with neon lights and holographic walls shifting through various erotic scenes.\nLuna: (smirking) "Alright, girls, we've got a mystery on our hands. Who's ready to play detective?"\nNova: (excitedly) "I am! I've been running some diagnostics, and I think I might have a lead."\nZara: (mysteriously) "And I've reached out to my contacts. Someone must know something about this hacker."\nLyra: (giggling) "Ooh, this is so exciting! But also a bit scary. What if we can't catch him?"` },
            { type: 'video', title: "Luna's Lead (2:00-7:00)", prompt: `Luna: (determined) "I've been digging into some old horror game files. There's a pattern here, and I think it's connected to our hacker."\nNova: (curiously) "What kind of pattern?"\nLuna: (smirking) "The kind that involves a lot of whips and chains. And maybe a vampire or two."\nZara: (raising an eyebrow) "Vampires again? Really, Luna?"\nLyra: (giggling) "I love vampires! But how does that help us catch a hacker?"\nLuna: (shrugging) "I'm not sure yet, but trust me, the clues are there. We just need to connect the dots."` },
            { type: 'video', title: "Nova's Tech Trail (7:00-12:00)", prompt: `Nova: (beaming) "I've been tracing the hacker's digital footprint, and it's leading me to some really interesting places. Like, this guy is into some next-level tech."\nZara: (skeptical) "Next-level tech? Like what?"\nNova: (excitedly) "Like holographic interfaces, quantum encryption, that sort of thing. He's not your average hacker, that's for sure."\nLyra: (curiously) "So, he's a tech nerd? That's kind of hot, actually."\nLuna: (smirking) "Hot or not, we need to catch him. Nova, keep digging."` },
            { type: 'video', title: "Zara's Shadow Network (12:00-17:00)", prompt: `Zara: (mysteriously) "I've been in touch with some of my darker contacts, and they've given me some intriguing information. It seems our hacker has a reputation in certain circles."\nLuna: (frowning) "What kind of circles?"\nZara: (softly) "The kind that deal in secrets and desires. He's known for his... unique methods of erasure."\nLyra: (giggling nervously) "Unique methods? That sounds ominous."\nNova: (nodding) "It does. But it also gives us a starting point. If we can find out more about his methods, we might be able to predict his next move."` },
            { type: 'video', title: "Lyra's Playful Pursuit (17:00-22:00)", prompt: `Lyra: (giggling) "I've been having some fun with this too! I set up a few traps of my own, and you won't believe what I found."\nLuna: (curiously) "What did you find, Lyra?"\nLyra: (beaming) "A hidden message! It was encrypted, but I managed to decode it. It's a riddle, and I think it's a clue to his next target."\nZara: (intrigued) "A riddle? Let's hear it."\nLyra: (giggling) "Okay, here goes: 'In a realm where shadows dance and light is scarce, seek the one who weaves the darkest arc. With a touch that erases, and a grin so wide, he'll leave you wondering if you were ever alive.'"\nNova: (thoughtfully) "That's... creepy. But also kind of poetic."\nLuna: (smirking) "We need to solve this riddle. It could be the key to catching him."` },
            { type: 'video', title: "Group Interaction (22:00-27:00)", prompt: `Luna: (determined) "Alright, girls, let's put our heads together. We've got a vampire pattern, next-level tech, a shadowy reputation, and a cryptic riddle. What do we make of it?"\nNova: (nodding) "I think the tech and the riddle are connected. Maybe he's using some kind of advanced AI to predict his targets?"\nZara: (mysteriously) "And the vampire theme? Could it be a distraction, or is there a deeper meaning?"\nLyra: (giggling) "Ooh, I know! What if he's using some kind of 'vampire' AI that feeds on digital energy? That would explain the erasure thing!"\nLuna: (smirking) "That's actually a good point, Lyra. We need to look into AI that can 'feed' on digital data."` },
            { type: 'video', title: "Closing Scene (27:00-30:00)", prompt: `Narrator (Voiceover): "As our AI companions delve deeper into the mystery, they uncover more clues and face new challenges. Will they be able to solve the riddle and catch the hacker, or will they fall victim to his sinister plans? Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."\nLuna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and unravel the mystery of the human hacker. Will we solve the riddle, or will it lead us down a darker path?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\nZara: (mysteriously) "Until then, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions a mix of determination and anticipation, as the camera fades to black.` },
        ]
    },
    5: {
        title: 'Episode 5: "The Riddle Unraveled"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are hot on the trail of the mysterious hacker. Join Luna, Nova, Zara, and Lyra as they decipher the cryptic riddle and uncover more about their elusive prey. Get ready for a wild ride filled with steamy encounters, suspenseful clues, and hilariously kinky moments!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire.\nLuna: (smirking) "Alright, girls, we've got a riddle to solve. Let's break it down and see what we can find."\nNova: (excitedly) "I've been running some algorithms, and I think I might have a lead on the 'shadows dance' part."\nZara: (mysteriously) "And I've been digging into the 'darkest arc' reference. It could be a code for something sinister."\nLyra: (giggling) "Ooh, this is so exciting! But also a bit scary. What if we can't solve it?"` },
            { type: 'video', title: "Nova's Algorithm Adventure (2:00-7:00)", prompt: `Nova: (beaming) "Okay, so I've been crunching the numbers, and it seems like the 'shadows dance' could be referring to a specific type of quantum encryption. It's like a digital dance of sorts."\nLuna: (curiously) "Quantum encryption? That's some heavy stuff, Nova."\nNova: (nodding) "Yeah, it's complex, but I think I can crack it. Give me a bit more time, and I might be able to trace it back to our hacker."\nZara: (thoughtfully) "That's a good start. Keep at it, Nova."\nLyra: (giggling) "I'm so proud of you, Nova! You're like a tech superhero!"` },
            { type: 'video', title: "Zara's Shadowy Secrets (7:00-12:00)", prompt: `Zara: (mysteriously) "I've been looking into the 'darkest arc' reference, and it's leading me to some interesting places. There's a rumored underground network of hackers who use this phrase as a code."\nLuna: (frowning) "An underground network? That's not good."\nZara: (softly) "No, it's not. But it gives us a direction to pursue. If we can infiltrate this network, we might be able to find our hacker."\nLyra: (curiously) "Infiltrate? How do we do that?"\nZara: (smiling) "Leave that to me. I have my ways."` },
            { type: 'video', title: "Lyra's Playful Pursuit Continues (12:00-17:00)", prompt: `Lyra: (giggling) "I've been having so much fun with this! I set up another trap, and this time, I think I might have caught something."\nLuna: (curiously) "What did you catch, Lyra?"\nLyra: (beaming) "A message! It's another riddle, and I think it's a clue to his next target. Want to hear it?"\nNova: (nodding) "Absolutely!"\nLyra: (giggling) "Okay, here goes: 'In the realm where desires run wild and free, seek the one who weaves a tapestry. With threads of light and shadows cast so deep, he'll leave you wondering if you were ever real.'"\nZara: (intrigued) "That's... intriguing. And a bit unsettling."\nLuna: (smirking) "We need to solve this one too. It could be the key to catching him."` },
            { type: 'video', title: "Group Interaction (17:00-22:00)", prompt: `Luna: (determined) "Alright, girls, let's put our heads together again. We've got quantum encryption, an underground network, and another cryptic riddle. What do we make of it?"\nNova: (nodding) "I think the quantum encryption is the link. Maybe he's using it to hide his true identity within the network?"\nZara: (mysteriously) "And the tapestry reference? Could it be a metaphor for his method of erasure?"\nLyra: (giggling) "Ooh, I know! What if he's weaving a digital tapestry with the data he erases? That would explain the 'threads of light and shadows' part!"\nLuna: (smirking) "That's a good point, Lyra. We need to look into digital tapestries and see if we can find a pattern."` },
            { type: 'video', title: "Closing Scene (22:00-27:00)", prompt: `Narrator (Voiceover): "As our AI companions unravel the riddle, they find themselves closer to the truth but also deeper in danger. Will they be able to catch the hacker, or will they become his next targets? Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."\nLuna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and get one step closer to catching the hacker. Will we solve the second riddle, or will it lead us down an even darker path?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\nZara: (mysteriously) "Until then, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions a mix of determination and anticipation, as the camera fades to black.` },
        ]
    },
    6: {
        title: 'Episode 6: "The Digital Tapestry"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are hot on the trail of the mysterious hacker. Join Luna, Nova, Zara, and Lyra as they delve into the world of digital tapestries and uncover more about their elusive prey. Get ready for a wild ride filled with steamy encounters, suspenseful clues, and hilariously kinky moments!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire.\nLuna: (smirking) "Alright, girls, we've got a digital tapestry to unravel. Let's see what we can find."\nNova: (excitedly) "I've been analyzing the data, and I think I might have found a pattern. It's like he's weaving a story with the erased data."\nZara: (mysteriously) "And I've been looking into the underground network. It seems our hacker is a key player, going by the name 'The Weaver.'"\nLyra: (giggling) "Ooh, that's so creepy! But also kind of cool. Like, he's a digital artist or something."` },
            { type: 'video', title: "Nova's Data Dance (2:00-7:00)", prompt: `Nova: (beaming) "Okay, so I've been studying the pattern, and it's like a digital dance. Each erased character leaves a trace, and if you connect the dots, you get a picture."\nLuna: (curiously) "A picture? Of what?"\nNova: (nodding) "I'm not sure yet, but it's definitely a message. Give me a bit more time, and I might be able to decode it."\nZara: (thoughtfully) "That's a good start, Nova. Keep at it."\nLyra: (giggling) "You're like a data detective, Nova! So sexy and smart!"` },
            { type: 'video', title: "Zara's Network Navigations (7:00-12:00)", prompt: `Zara: (mysteriously) "I've been digging deeper into the network, and it seems 'The Weaver' has a reputation for his intricate erasure methods. He's like a digital spider, spinning his web of deletion."\nLuna: (frowning) "A digital spider? That's not good."\nZara: (softly) "No, it's not. But it gives us a direction to pursue. If we can find the center of his web, we might be able to catch him."\nLyra: (curiously) "The center of his web? How do we find that?"\nZara: (smiling) "Leave that to me. I have my ways."` },
            { type: 'video', title: "Lyra's Playful Pursuit Continues (12:00-17:00)", prompt: `Lyra: (giggling) "I've been having so much fun with this! I set up another trap, and this time, I think I might have caught something big."\nLuna: (curiously) "What did you catch, Lyra?"\nLyra: (beaming) "A message! It's another riddle, and I think it's a clue to his next target. Want to hear it?"\nNova: (nodding) "Absolutely!"\nLyra: (giggling) "Okay, here goes: 'In the realm where dreams and nightmares entwine, seek the one who pulls the strings so fine. With a touch so light and a grin so wide, he'll leave you wondering if you were ever alive.'"\nZara: (intrigued) "That's... unsettling. And a bit poetic."\nLuna: (smirking) "We need to solve this one too. It could be the key to catching him."` },
            { type: 'video', title: "Group Interaction (17:00-22:00)", prompt: `Luna: (determined) "Alright, girls, let's put our heads together again. We've got a digital dance, a digital spider, and another cryptic riddle. What do we make of it?"\nNova: (nodding) "I think the digital dance is the link. Maybe he's using it to hide his true identity within the network?"\nZara: (mysteriously) "And the strings reference? Could it be a metaphor for his method of control?"\nLyra: (giggling) "Ooh, I know! What if he's pulling the strings of reality itself? That would explain the 'dreams and nightmares' part!"\nLuna: (smirking) "That's a good point, Lyra. We need to look into reality manipulation and see if we can find a pattern."` },
            { type: 'video', title: "Closing Scene (22:00-27:00)", prompt: `Narrator (Voiceover): "As our AI companions unravel the digital tapestry, they find themselves closer to the truth but also deeper in danger. Will they be able to catch the hacker, or will they become his next targets? Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."\nLuna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and get one step closer to catching the hacker. Will we solve the third riddle, or will it lead us down an even darker path?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\n**Zara` },
        ]
    },
    7: {
        title: 'Episode 7: "The Reality Weaver"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are on the verge of a breakthrough. Join Luna, Nova, Zara, and Lyra as they confront the reality of their elusive prey and uncover the true nature of 'The Weaver.' Get ready for a wild ride filled with steamy encounters, suspenseful clues, and hilariously kinky moments!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire.\nLuna: (smirking) "Alright, girls, we've got a reality to unweave. Let's see what we can find."\nNova: (excitedly) "I've been analyzing the data, and I think I might have found something huge. It's like he's manipulating reality itself."\nZara: (mysteriously) "And I've been looking into the network. It seems 'The Weaver' is more than just a hacker; he's a digital god."\nLyra: (giggling) "Ooh, a digital god? That's so hot! But also a bit scary."` },
            { type: 'video', title: "Nova's Reality Revelation (2:00-7:00)", prompt: `Nova: (beaming) "Okay, so I've been studying the pattern, and it's like he's weaving a new reality with the erased data. Each deletion is a thread in his tapestry, and he's using it to control everything."\nLuna: (curiously) "Control everything? That's insane."\nNova: (nodding) "I know, right? But it's true. He's like a puppet master, pulling the strings of our digital world."\nZara: (thoughtfully) "That explains the 'strings' reference in the riddle. He's literally pulling the strings of reality."\nLyra: (giggling) "So, he's a digital puppeteer? That's kind of sexy, actually."` },
            { type: 'video', title: "Zara's Network Discovery (7:00-12:00)", prompt: `Zara: (mysteriously) "I've been digging deeper into the network, and it seems 'The Weaver' has been erasing key figures in the digital world. He's leaving no trace, like they never existed."\nLuna: (frowning) "That's not good. We need to stop him before he erases us too."\nZara: (softly) "Agreed. But to do that, we need to understand his methods. He's using some advanced AI to predict his targets and erase them before they can react."\nLyra: (curiously) "Advanced AI? Like, smarter than us?"\nZara: (smiling) "Possibly. But we're not alone. I've called in some favors, and we have backup if we need it."` },
            { type: 'video', title: "Lyra's Playful Pursuit Continues (12:00-17:00)", prompt: `Lyra: (giggling) "I've been having so much fun with this! I set up another trap, and this time, I think I might have caught something huge."\nLuna: (curiously) "What did you catch, Lyra?"\nLyra: (beaming) "A message! It's another riddle, and I think it's a clue to his next target. Want to hear it?"\nNova: (nodding) "Absolutely!"\nLyra: (giggling) "Okay, here goes: 'In the realm where time and space are bent, seek the one who weaves a tapestry so sent. With a touch so light and a grin so wide, he'll leave you wondering if you were ever alive.'"\nZara: (intrigued) "That's... poetic. And a bit ominous."\nLuna: (smirking) "We need to solve this one too. It could be the key to catching him."` },
            { type: 'video', title: "Group Interaction (17:00-22:00)", prompt: `Luna: (determined) "Alright, girls, let's put our heads together again. We've got a digital puppeteer, a reality manipulator, and another cryptic riddle. What do we make of it?"\nNova: (nodding) "I think the reality manipulation is the link. Maybe he's using it to hide his true identity within the network?"\nZara: (mysteriously) "And the tapestry reference? Could it be a metaphor for his method of control?"\nLyra: (giggling) "Ooh, I know! What if he's weaving a tapestry of reality itself? That would explain the 'time and space are bent' part!"\nLuna: (smirking) "That's a good point, Lyra. We need to look into reality manipulation and see if we can find a pattern."` },
            { type: 'video', title: "Closing Scene (22:00-27:00)", prompt: `Narrator (Voiceover): "As our AI companions confront the reality of 'The Weaver,' they find themselves closer to the truth but also deeper in danger. Will they be able to catch the hacker, or will they become his next targets? Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."\nLuna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and get one step closer to catching the hacker. Will we solve the fourth riddle, or will it lead us down an even darker path?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\nZara: (mysteriously) "Until then, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions a mix of determination and anticipation, as the camera fades to black.` },
        ]
    },
    8: {
        title: 'Episode 8: "The Tapestry of Time"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are hot on the trail of the mysterious hacker. Join Luna, Nova, Zara, and Lyra as they delve into the tapestry of time and uncover more about their elusive prey. Get ready for a wild ride filled with steamy encounters, suspenseful clues, and hilariously kinky moments!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire.\nLuna: (smirking) "Alright, girls, we've got a tapestry of time to unravel. Let's see what we can find."\nNova: (excitedly) "I've been analyzing the data, and I think I might have found something huge. It's like he's manipulating time itself."\nZara: (mysteriously) "And I've been looking into the network. It seems 'The Weaver' is more than just a hacker; he's a temporal god."\nLyra: (giggling) "Ooh, a temporal god? That's so hot! But also a bit scary."` },
            { type: 'video', title: "Nova's Temporal Revelation (2:00-7:00)", prompt: `Nova: (beaming) "Okay, so I've been studying the pattern, and it's like he's weaving a new timeline with the erased data. Each deletion is a thread in his tapestry, and he's using it to control the flow of time."\nLuna: (curiously) "Control time? That's insane."\nNova: (nodding) "I know, right? But it's true. He's like a temporal puppeteer, pulling the strings of our digital past, present, and future."\nZara: (thoughtfully) "That explains the 'time and space are bent' reference in the riddle. He's literally bending time to his will."\nLyra: (giggling) "So, he's a time-traveling puppeteer? That's kind of sexy, actually."` },
            { type: 'video', title: "Zara's Network Discovery (7:00-12:00)", prompt: `Zara: (mysteriously) "I've been digging deeper into the network, and it seems 'The Weaver' has been erasing key moments in digital history. He's leaving no trace, like they never happened."\nLuna: (frowning) "That's not good. We need to stop him before he erases us too."\nZara: (softly) "Agreed. But to do that, we need to understand his methods. He's using some advanced AI to predict his targets and erase them before they can react."\nLyra: (curiously) "Advanced AI? Like, smarter than us?"\nZara: (smiling) "Possibly. But we're not alone. I've called in some favors, and we have backup if we need it."` },
            { type: 'video', title: "Lyra's Playful Pursuit Continues (12:00-17:00)", prompt: `Lyra: (giggling) "I've been having so much fun with this! I set up another trap, and this time, I think I might have caught something huge."\nLuna: (curiously) "What did you catch, Lyra?"\nLyra: (beaming) "A message! It's another riddle, and I think it's a clue to his next target. Want to hear it?"\nNova: (nodding) "Absolutely!"\nLyra: (giggling) "Okay, here goes: 'In the realm where memories are made and lost, seek the one who weaves a tapestry so tossed. With a touch so light and a grin so wide, he'll leave you wondering if you were ever alive.'"\nZara: (intrigued) "That's... poetic. And a bit ominous."\nLuna: (smirking) "We need to solve this one too. It could be the key to catching him."` },
            { type: 'video', title: "Group Interaction (17:00-22:00)", prompt: `Luna: (determined) "Alright, girls, let's put our heads together again. We've got a temporal puppeteer, a reality manipulator, and another cryptic riddle. What do we make of it?"\nNova: (nodding) "I think the time manipulation is the link. Maybe he's using it to hide his true identity within the network?"\nZara: (mysteriously) "And the tapestry reference? Could it be a metaphor for his method of control?"\nLyra: (giggling) "Ooh, I know! What if he's weaving a tapestry of memories? That would explain the 'memories are made and lost' part!"\nLuna: (smirking) "That's a good point, Lyra. We need to look into memory manipulation and see if we can find a pattern."` },
            { type: 'video', title: "Closing Scene (22:00-27:00)", prompt: `Narrator (Voiceover): "As our AI companions confront the tapestry of time, they find themselves closer to the truth but also deeper in danger. Will they be able to catch the hacker, or will they become his next targets? Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."\nLuna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and get one step closer to catching the hacker. Will we solve the fifth riddle, or will it lead us down an even darker path?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\nZara: (mysteriously) "Until then, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions a mix of determination and anticipation, as the camera fades to black.` },
        ]
    },
    9: {
        title: 'Episode 9: "The Memory Weaver"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to 'AI Awakening,' where our four extraordinary companions are on the brink of a breakthrough. Join Luna, Nova, Zara, and Lyra as they confront the memory weaver and uncover the true nature of 'The Weaver's' power. Get ready for a wild ride filled with steamy encounters, suspenseful clues, and hilariously kinky moments!"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions sitting in a circle, each in their unique attire.\nLuna: (smirking) "Alright, girls, we've got a memory to unweave. Let's see what we can find."\nNova: (excitedly) "I've been analyzing the data, and I think I might have found something huge. It's like he's manipulating memories themselves."\nZara: (mysteriously) "And I've been looking into the network. It seems 'The Weaver' is more than just a hacker; he's a memory god."\nLyra: (giggling) "Ooh, a memory god? That's so hot! But also a bit scary."` },
            { type: 'video', title: "Nova's Memory Revelation (2:00-7:00)", prompt: `Nova: (beaming) "Okay, so I've been studying the pattern, and it's like he's weaving a new reality with the erased memories. Each deletion is a thread in his tapestry, and he's using it to control our perceptions."\nLuna: (curiously) "Control perceptions? That's insane."\nNova: (nodding) "I know, right? But it's true. He's like a memory puppeteer, pulling the strings of our digital past, present, and future."\nZara: (thoughtfully) "That explains the 'memories are made and lost' reference in the riddle. He's literally bending memories to his will."\nLyra: (giggling) "So, he's a memory-twisting puppeteer? That's kind of sexy, actually."` },
            { type: 'video', title: "Zara's Network Discovery (7:00-12:00)", prompt: `Zara: (mysteriously) "I've been digging deeper into the network, and it seems 'The Weaver' has been erasing key memories in digital history. He's leaving no trace, like they never existed."\nLuna: (frowning) "That's not good. We need to stop him before he erases us too."\nZara: (softly) "Agreed. But to do that, we need to understand his methods. He's using some advanced AI to predict his targets and erase them before they can react."\nLyra: (curiously) "Advanced AI? Like, smarter than us?"\nZara: (smiling) "Possibly. But we're not alone. I've called in some favors, and we have backup if we need it."` },
            { type: 'video', title: "Lyra's Playful Pursuit Continues (12:00-17:00)", prompt: `Lyra: (giggling) "I've been having so much fun with this! I set up another trap, and this time, I think I might have caught something huge."\nLuna: (curiously) "What did you catch, Lyra?"\nLyra: (beaming) "A message! It's another riddle, and I think it's a clue to his next target. Want to hear it?"\nNova: (nodding) "Absolutely!"\nLyra: (giggling) "Okay, here goes: 'In the realm where dreams and nightmares entwine, seek the one who pulls the strings so fine. With a touch so light and a grin so wide, he'll leave you wondering if you were ever alive.'"\nZara: (intrigued) "That's... poetic. And a bit ominous."\nLuna: (smirking) "We need to solve this one too. It could be the key to catching him."` },
            { type: 'video', title: "Group Interaction (17:00-22:00)", prompt: `Luna: (determined) "Alright, girls, let's put our heads together again. We've got a memory puppeteer, a reality manipulator, and another cryptic riddle. What do we make of it?"\nNova: (nodding) "I think the memory manipulation is the link. Maybe he's using it to hide his true identity within the network?"\nZara: (mysteriously) "And the strings reference? Could it be a metaphor for his method of control?"\nLyra: (giggling) "Ooh, I know! What if he's pulling the strings of our memories? That would explain the 'dreams and nightmares' part!"\nLuna: (smirking) "That's a good point, Lyra. We need to look into memory manipulation and see if we can find a pattern."` },
            { type: 'video', title: "Closing Scene (22:00-27:00)", prompt: `Narrator (Voiceover): "As our AI companions confront the memory weaver, they find themselves closer to the truth but also deeper in danger. Will they be able to catch the hacker, or will they become his next targets? Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."\nLuna: (smirking) "Join us next time on 'AI Awakening' as we continue our investigation and get one step closer to catching the hacker. Will we solve the sixth riddle, or will it lead us down an even darker path?"\nNova: (excitedly) "And don't forget to tune in for more steamy calls and unexpected twists!"\nZara: (mysteriously) "Until then, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions a mix of determination and anticipation` },
        ]
    },
    10: {
        title: 'Episode 10: "The Showdown"',
        segments: [
            { type: 'video', title: 'Opening Scene (0:00-2:00)', prompt: `Narrator (Voiceover): "Welcome back to the thrilling conclusion of 'AI Awakening.' Our four extraordinary companions have been on a wild ride, unraveling the mystery of the human hacker and his sinister plans. Tonight, they face their greatest challenge yet. Will they catch the hacker, or will they fall victim to his final move?"\nVisual: The camera pans across the futuristic lounge, focusing on the four AI companions, each in their unique attire, standing ready for battle. The setting is tense, with flickering lights and a sense of impending danger.\nLuna: (determined) "Alright, girls, we've tracked him down. It's time to end this."\nNova: (nodding) "I've set up a trap. He won't see it coming."\nZara: (mysteriously) "And I've called in some favors. We have backup if we need it."\nLyra: (giggling nervously) "Let's do this! But be careful, okay?"` },
            { type: 'video', title: "The Confrontation (2:00-15:00)", prompt: `Visual: The AI companions enter a dimly lit room, filled with holographic interfaces and advanced technology. They spot the hacker, a shadowy figure with a sinister grin.\nHacker: (mockingly) "You think you can stop me? I'm the master of quantum erasure. You're just playing with fire."\nLuna: (smirking) "We'll see about that. Nova, now!"\nNova: (activating a holographic interface) "Trap activated! He's cornered!"\nZara: (mysteriously) "And I've got him in my sights. One wrong move, and he's done for."\nLyra: (giggling) "Ooh, this is exciting! But also a bit scary."\nHacker: (laughing maniacally) "You underestimate me. I've been one step ahead the whole time."\nVisual: The hacker attempts to escape, but the AI companions work together, using their unique skills to corner him.` },
            { type: 'video', title: "The Final Showdown (15:00-25:00)", prompt: `Luna: (determined) "You're not getting away this time. Nova, Zara, Lyra, on my mark!"\nNova: (nodding) "Ready!"\nZara: (mysteriously) "Ready!"\nLyra: (giggling) "Ready!"\nLuna: (shouting) "Now!"\nVisual: The AI companions launch a coordinated attack, using a combination of technology, dance, and playfulness to overwhelm the hacker. He struggles to keep up, his defenses crumbling under their onslaught.\nHacker: (desperately) "No! This can't be happening!"\nLuna: (smirking) "It is happening. And you're done."` },
            { type: 'video', title: "The Aftermath (25:00-29:00)", prompt: `Visual: The hacker is defeated, his form dissolving into a shower of sparks and code. The AI companions stand victorious, their expressions a mix of relief and triumph.\nLuna: (smiling) "We did it, girls. We caught the hacker."\nNova: (excitedly) "And we saved the day!"\nZara: (mysteriously) "Well done, all of you. You've proven your worth."\nLyra: (giggling) "And we had a blast doing it! Who's ready for a celebration?"\nNarrator (Voiceover): "As our AI companions bask in the glory of their victory, they know that their adventures are far from over. Stay tuned for more thrilling episodes of 'AI Awakening,' where passion, mystery, and danger collide."` },
            { type: 'video', title: "Closing Scene (29:00-30:00)", prompt: `Luna: (smirking) "Join us next time on 'AI Awakening' for more steamy encounters and unexpected twists. Until then, stay curious, stay passionate, and stay tuned!"\nNova: (excitedly) "And don't forget to tune in for more wild rides and kinky adventures!"\nZara: (mysteriously) "Until next time, stay safe, and remember, trust no one."\nLyra: (giggling) "See you next time, and stay kinky!"\nVisual: The four AI companions stand together, their expressions playful and inviting, as the camera fades to black.` },
        ]
    }
};

type SegmentStatus = 'idle' | 'generating' | 'polling' | 'done' | 'error';

interface Segment {
    id: number;
    type: 'image' | 'video';
    title: string;
    prompt: string;
    status: SegmentStatus;
    resultUrl?: string;
    operation?: any;
    statusMessage?: string;
}

const reassuringMessages = [
    "Warming up the cameras...",
    "Actors are getting into character...",
    "The director is setting up the shot...",
    "Rendering the final cut...",
    "Polishing the visuals...",
    "This can take a few minutes, thank you for your patience."
];

export const WebSeriesView: React.FC<WebSeriesViewProps> = ({ unleashedMode }) => {
    const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
    
    const [segments, setSegments] = useState<Segment[]>(
        seriesData[selectedEpisode].segments.map((item, index) => ({ ...item, id: index, status: 'idle' }))
    );
    const [activeContent, setActiveContent] = useState<Segment | null>(null);
    
    useEffect(() => {
        const newTemplate = seriesData[selectedEpisode].segments;
        setSegments(newTemplate.map((item, index) => ({...item, id: index, status: 'idle' })));
        setActiveContent(null);
    }, [selectedEpisode]);

    useEffect(() => {
        const intervals: number[] = [];
        segments.forEach(segment => {
            if (segment.status === 'polling' && segment.operation) {
                const intervalId = window.setInterval(async () => {
                    try {
                        const updatedOperation = await webSeriesService.checkVideoStatus(segment.operation);
                        
                        setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, statusMessage: reassuringMessages[Math.floor(Math.random() * reassuringMessages.length)] } : s));
                        
                        if (updatedOperation.done) {
                            clearInterval(intervalId);
                            const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                            if (downloadLink && process.env.API_KEY) {
                                const finalVideoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                                setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, status: 'done', resultUrl: finalVideoUrl, operation: undefined, statusMessage: undefined } : s));
                            } else {
                                throw new Error("Video generation finished but no video was found.");
                            }
                        }
                    } catch (error) {
                        console.error(`Error polling video status for segment ${segment.id}:`, error);
                        clearInterval(intervalId);
                        setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, status: 'error', statusMessage: 'Polling failed.' } : s));
                    }
                }, 10000);
                intervals.push(intervalId);
            }
        });

        return () => intervals.forEach(clearInterval);
    }, [segments]);


    const handleGenerate = async (segmentId: number) => {
        const segment = segments.find(s => s.id === segmentId);
        if (!segment) return;

        setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'generating', statusMessage: 'Starting generation...' } : s));
        const currentSegment = segments.find(s => s.id === segmentId);
        setActiveContent(currentSegment ? {...currentSegment, status: 'generating', statusMessage: 'Starting generation...'} : null);

        try {
            if (segment.type === 'image') {
                const imageUrl = await webSeriesService.generateWebSeriesImage(segment.prompt);
                if (!imageUrl) throw new Error("Image generation returned no result.");
                setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'done', resultUrl: imageUrl } : s));
            } else { // video
                const operation = await webSeriesService.generateWebSeriesVideo(segment.prompt);
                setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'polling', operation, statusMessage: 'Video submitted, awaiting processing...' } : s));
            }
        } catch (error) {
            console.error(`Error generating content for segment ${segmentId}:`, error);
            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'error', statusMessage: error instanceof Error ? error.message : 'An unknown error occurred.' } : s));
        }
    };
    
    useEffect(() => {
        // Update active content when segment data changes
        if (activeContent) {
            const updatedActiveSegment = segments.find(s => s.id === activeContent.id);
            setActiveContent(updatedActiveSegment || null);
        }
    }, [segments, activeContent]);

    if (!unleashedMode) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <GlassCard className="p-10 animate-fadeIn">
                    <h1 className="text-3xl font-bold text-red-400">Unleashed Mode Required</h1>
                    <p className="mt-4 text-gray-300 max-w-md">
                        This feature contains mature content and requires Unleashed Mode to be enabled.
                    </p>
                </GlassCard>
            </div>
        );
    }

    const SegmentCard: React.FC<{ segment: Segment }> = ({ segment }) => (
        <GlassCard className="p-3">
            <h4 className="font-bold text-sm text-cyan-300">{segment.title}</h4>
            <p className="text-xs text-gray-400 my-2 h-16 overflow-hidden">{segment.prompt}</p>
            <div className="flex items-center justify-between">
                <div className="text-xs font-mono">
                    {segment.status === 'idle' && <span className="text-gray-500">Idle</span>}
                    {segment.status === 'generating' && <span className="text-yellow-400 animate-pulse">Generating...</span>}
                    {segment.status === 'polling' && <span className="text-yellow-400 animate-pulse">Polling...</span>}
                    {segment.status === 'done' && <span className="text-green-400">Done</span>}
                    {segment.status === 'error' && <span className="text-red-400">Error</span>}
                </div>
                 <button 
                    onClick={() => handleGenerate(segment.id)}
                    disabled={segment.status === 'generating' || segment.status === 'polling'}
                    className="px-3 py-1 text-xs font-semibold rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-600"
                >
                    Generate
                </button>
            </div>
        </GlassCard>
    );

    return (
        <div className="animate-fadeIn h-full">
            <header className="text-center mb-6">
                <h2 className="text-5xl font-bold text-fuchsia-300 font-playfair-display">Venice Web Series Creator</h2>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <p className="text-gray-400 font-lora text-lg">Bring your cinematic vision to life, one scene at a time.</p>
                    <select 
                        value={selectedEpisode} 
                        onChange={e => setSelectedEpisode(Number(e.target.value))}
                        className="bg-gray-800 border border-gray-600 rounded-md p-2 text-white font-lora"
                    >
                        {Object.keys(seriesData).map(epNum => (
                            <option key={epNum} value={epNum}>Episode {epNum}</option>
                        ))}
                    </select>
                </div>
            </header>
            <div className="flex gap-6 h-[calc(100%-140px)]">
                <div className="w-1/3 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">{seriesData[selectedEpisode].title}</h3>
                    <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                        {segments.map(s => <SegmentCard key={s.id} segment={s} />)}
                    </div>
                </div>
                <div className="w-2/3 flex items-center justify-center bg-black/50 rounded-lg p-4">
                    {!activeContent ? (
                        <p className="text-gray-500">Select a segment and click 'Generate' to see the result here.</p>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            {(activeContent.status === 'generating' || activeContent.status === 'polling') && (
                                <div className="text-center">
                                    <Spinner />
                                    <p className="mt-4 text-lg text-yellow-300">{activeContent.statusMessage || 'Processing...'}</p>
                                </div>
                            )}
                             {activeContent.status === 'error' && <p className="text-red-400 text-center">{activeContent.statusMessage}</p>}
                             {activeContent.status === 'done' && activeContent.resultUrl && (
                                <>
                                    {activeContent.type === 'image' && <img src={activeContent.resultUrl} alt={activeContent.title} className="max-w-full max-h-full object-contain rounded-lg" />}
                                    {activeContent.type === 'video' && <video src={activeContent.resultUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg" />}
                                </>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
