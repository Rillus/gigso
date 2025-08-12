export default class UkuleleSongLibrary {
    static songs = [
        {
            id: 'dont-stop-believin',
            title: 'Don\'t Stop Believin\'',
            artist: 'Journey',
            key: 'C',
            difficulty: 'beginner',
            genre: 'rock',
            tempo: 120,
            chordProgression: ['C', 'Am', 'F', 'G'],
            strummingPattern: 'D-D-U-U-D-U',
            strummingNotes: 'Down-Down-Up-Up-Down-Up pattern, repeat for each chord',
            tags: ['beginner-friendly', 'practice'],
            lyrics: `
                [Intro]
                {C}   {G}   {Am}   {F}
                {C}   {G}   {F}
                
                [Verse 1]
                {C}   Just a {G}small town girl,{Am}  livin' in a {F}lonely world
                {C}   She took the {G}midnight train going {F}anywhere{F}
                {C}   Just a {G}city boy,{Am}    born and raised in {F}South Detroit
                {C}   He took the {G}midnight train going {F}anywhere
                
                [Instrumental]
                {C}   {G}   {Am}   {F}
                {C}   {G}   {F}   {F}
                
                [Verse 2]
                {C}A singer in a {G}smoky room, {Am}the smell of wine and {F}cheap perfume
                {C}  For a smile they can {G}share the night, it goes {F}on and on {F}and on and on
                
                [Chorus]
                {F}Strangers waitin'   {C}up and down the boulevard
                Their {F}shadows searchin' in the {C}night
                {F}Streetlights, people, {C}livin' just to find emotion
                {F}Hidin', somewhere in the {G}ni{C}ght {G}  {C}  {F}
                
                [Break]
                {C}   {G}   {Am}   {F}
                
                [Verse 3]
                {C}   Workin' hard to {G}get my fill,{Am}  everybody {F}wants a thrill
                {C}   Payin' anything to {G}roll the dice, just {Em}one more {F}time
                {C}   Some'll win, {G}some will lose,{Am}  some are born to {F}sing the blues
                {C}   Oh, the movie {G}never ends; it goes {Em}on and on and {F}on and on
                
                [Chorus]
                {F}Strangers waitin' {C} up and down the boulevard
                Their {F}shadows searchin' in the {C}night
                {F}Streetlights, people, {C}livin' just to find emotion
                {F}Hidin', somewhere in the {G}ni{C}ght{G}  {C}  {F}
                
                [Guitar Solo]
                {C}   {G}   {Am}   {F}
                {C}   {G}   {F}   {F}
                
                [Outro]
                {C}Don't stop be{G}lievin', {Am}hold on to that {F}feelin'
                {C}Streetlights, {G}people, oh-oh-{F}o-{F}------h
                {C}Don't stop be{G}lievin', {Am} hold o-{F}----n
                {C}Streetlights, {G}people, oh-oh-{F}o----{F}---h
                {C}Don't stop be{G}lievin', {Am}hold on to that {F}feelin'
                {C}Streetlights, {G}people, oh-oh-o{F}----{F}--h`
        },
        {
            id: 'ipsum-ballad',
            title: 'Ipsum Ballad',
            artist: 'Demo Musician',
            key: 'C',
            difficulty: 'intermediate',
            genre: 'pop',
            tempo: 90,
            chordProgression: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
            strummingPattern: 'D-D-U-D-U-D-U',
            strummingNotes: 'Gentle strumming pattern, emphasize the downbeats',
            tags: ['ballad', 'slow-tempo', 'emotional'],
            lyrics: `[Verse 1]
Sed ut perspiciatis unde omnis
Iste natus error sit voluptatem
Accusantium doloremque laudantium
Totam rem aperiam eaque

[Pre-Chorus]
Ipsa quae ab illo inventore
Veritatis et quasi architecto
Beatae vitae dicta sunt
Explicabo nemo enim

[Chorus]
Ipsam voluptatem quia voluptas
Sit aspernatur aut odit aut
Fugit sed quia consequuntur
Magni dolores eos qui

[Verse 2]
Ratione voluptatem sequi nesciunt
Neque porro quisquam est qui
Dolorem ipsum quia dolor sit
Amet consectetur adipisci

[Pre-Chorus]
Ipsa quae ab illo inventore
Veritatis et quasi architecto
Beatae vitae dicta sunt
Explicabo nemo enim

[Chorus]
Ipsam voluptatem quia voluptas
Sit aspernatur aut odit aut
Fugit sed quia consequuntur
Magni dolores eos qui`,
        },
        {
            id: 'dolor-rhythm',
            title: 'Dolor Rhythm',
            artist: 'Practice Band',
            key: 'C',
            difficulty: 'beginner',
            genre: 'indie',
            tempo: 140,
            chordProgression: ['C', 'F', 'G', 'C'],
            strummingPattern: 'D-U-D-U-D-U-D-U',
            strummingNotes: 'Fast alternating strumming, keep it light and bouncy',
            tags: ['upbeat', 'simple-chords', 'rhythm-practice'],
            lyrics: `[Verse 1]
At vero eos et accusamus
Et iusto odio dignissimos
Ducimus qui blanditiis
Praesentium voluptatum

[Chorus]
Deleniti atque corrupti
Quos dolores et quas
Molestias excepturi sint
Occaecati cupiditate

[Verse 2]
Non provident similique sunt
In culpa qui officia
Deserunt mollitia animi
Id est laborum et dolorum

[Chorus]
Deleniti atque corrupti
Quos dolores et quas
Molestias excepturi sint
Occaecati cupiditate

[Bridge]
Fuga et harum quidem
Rerum facilis est et
Expedita distinctio nam
Libero tempore cum`,
        }
    ];
}