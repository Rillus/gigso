export default class UkuleleSongLibrary {
    static songs = [
        {
            id: 'don-t-stop-believin',
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
{F}Hidin', somewhere in the {G}ni{C}ght {G} {C} {F}
 
[Break]
C   G   Am   F
 
[Verse 3]
C                  G           Am           F
   Workin' hard to get my fill,    everybody wants a thrill
C                     G                   Em       F
   Payin' anything to roll the dice, just one more time
C              G               Am                  F
   Some'll win, some will lose,    some are born to sing the blues
C                G                   Em            F
   Oh, the movie never ends; it goes on and on and on and on
 
[Chorus]
F                 C
Strangers waitin'   up and down the boulevard
      F                         C
Their shadows searchin' in the night
F                     C
Streetlights, people,   livin' just to find emotion
F                         G  C    G  C F
Hidin', somewhere in the night
 
[Guitar Solo]
C   G   Am   F
C   G   Em   F
 
[Outro]
C            G        Am                 F
Don't stop believin',     hold on to that feelin'
C             G             Em   F
Streetlights, people, oh-oh-o-------h
C            G        Am        F
Don't stop believin',    hold o-----n
C             G             Em   F
Streetlights, people, oh-oh-o-------h
C            G        Am                 F
Don't stop believin',     hold on to that feelin'
C             G             Em   F
Streetlights, people, oh-oh-o-------h

                [Verse 2]
                A singer in a smokey room
                A smell of wine and cheap perfume
                For a smile they can share the night
                It goes on and on and on and on

                [Chorus]
                Strangers waitin'
                Up and down the boulevard
                Their shadows searchin' in the night
                Streetlights, people
                Livin' just to find emotion
                Hidin' somewhere in the night

                [Verse 3]
                Workin' hard to get my fill
                Everybody wants a thrill
                Payin' anything to roll the dice
                Just one more time
                Some'll win, some will lose
                Some are born to sing the blues
                Whoa, the movie never ends
                It goes on and on and on and on

                [Chorus]
                Strangers waitin'
                Up and down the boulevard
                Their shadows searchin' in the night
                Streetlights, people
                Livin' just to find emotion
                Hidin', somewhere in the night

                [Outro]
                Don't stop believin'
                Hold on to that feelin'
                Streetlights, people
                Don't stop believin'
                Hold on
                Streetlights, people
                Don't stop believin'
                Hold on to that feelin'
                Streetlights, people`,
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