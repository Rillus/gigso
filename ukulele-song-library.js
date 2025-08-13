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
            id: 'with-or-without-you',
            title: 'With or Without You',
            artist: 'U2',
            key: 'C',
            difficulty: 'beginner',
            genre: 'rock',
            tempo: 120,
            chordProgression: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
            strummingPattern: 'D-D-U-D-U-D-U',
            strummingNotes: 'Gentle strumming pattern, emphasize the downbeats',
            tags: ['ballad', 'slow-tempo', 'emotional'],
            lyrics: `
[Intro]
{C}
{C}   {G}    {Am}   {F}
{C}   {G}    {Am}   {F}

[Verse 1]
{C}    See the {G}stone set in your {Am}eyes
See the {F}thorn twist in your {C}side
I {G}wait for you{Am}    {F}

[Verse 2]
{C}    Sleight of {G}hand and twist of {Am}fate
On a bed of {F}nails she makes me {C}wait
And I {G}wait with{Am}out yo{F}u 

[Chorus]
With or with{C}out you {G}
With or {Am}without you {F}

[Verse 3]
{C}     Through the {G}storm we reach the {Am}shore
You give it {F}all but I want {C}more
And I'm {G}waiting for {Am}you {F}

[Chorus]
With or with{C}out you {G}
With or {Am}without you {F}
I can't {C}live
{G}With or with{Am}out you {F}

[Bridge]
{C}  {G}  {Am}   {F}

[Verse 4]
And you {C}give yourself aw{G}ay
And you {Am}give yourself aw{F}ay
And you {C}give
And you {G}give
And you {Am}give yourself {F}away

[Verse 5]
{C}   My hands are {G}tied  {Am}
My body {F}bruised, she's got me with
{C}  Nothing to {G}win and
{Am}Nothing left to {F}lose

[Verse 6]
And you {C}give yourself aw{G}ay
And you {Am}give yourself aw{F}ay
And you {C}give
And you {G}give
And you {Am}give yourself {F}away

[Chorus]

[Outro]
{C}  {G}  {Am}   {F}
{C}  {G}  {Am}   {F}
With or with{C}out you {G}
With or {Am}without you {F}
I can't {C}live
{G}With or with{Am}out you {F}
`
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