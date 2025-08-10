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
                [Verse 1]
                Just a small town girl
                Livin' in a lonely world
                She took the midnight train going anywhere
                Just a city boy
                Born and raised in South Detroit
                He took the midnight train going anywhere

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
            chordPositions: {
                'Just a small town girl': [
                    { position: 0, chord: 'C' }
                ],
                'Livin\' in a lonely world': [
                    { position: 0, chord: 'G' }
                ],
                'She took the midnight train going anywhere': [
                    { position: 0, chord: 'Am' },
                    { position: 25, chord: 'F' }
                ],
                'Just a city boy': [
                    { position: 0, chord: 'C' }
                ],
                'Born and raised in South Detroit': [
                    { position: 0, chord: 'G' }
                ],
                'He took the midnight train going anywhere': [
                    { position: 0, chord: 'Am' },
                    { position: 24, chord: 'F' }
                ],
                'A singer in a smokey room': [
                    { position: 0, chord: 'C' }
                ],
                'A smell of wine and cheap perfume': [
                    { position: 0, chord: 'G' }
                ],
                'For a smile they can share the night': [
                    { position: 0, chord: 'Am' },
                    { position: 20, chord: 'F' }
                ],
                'It goes on and on and on and on': [
                    { position: 0, chord: 'C' },
                    { position: 15, chord: 'G' }
                ],
                'Strangers waitin\'': [
                    { position: 0, chord: 'C' }
                ],
                'Up and down the boulevard': [
                    { position: 0, chord: 'G' }
                ],
                'Their shadows searchin\' in the night': [
                    { position: 0, chord: 'Am' },
                    { position: 20, chord: 'F' }
                ],
                'Streetlights, people': [
                    { position: 0, chord: 'C' }
                ],
                'Livin\' just to find emotion': [
                    { position: 0, chord: 'G' }
                ],
                'Hidin\' somewhere in the night': [
                    { position: 0, chord: 'Am' },
                    { position: 15, chord: 'F' }
                ],
                'Hidin\', somewhere in the night': [
                    { position: 0, chord: 'Am' },
                    { position: 16, chord: 'F' }
                ],
                'Workin\' hard to get my fill': [
                    { position: 0, chord: 'C' }
                ],
                'Everybody wants a thrill': [
                    { position: 0, chord: 'G' }
                ],
                'Payin\' anything to roll the dice': [
                    { position: 0, chord: 'Am' },
                    { position: 20, chord: 'F' }
                ],
                'Just one more time': [
                    { position: 0, chord: 'C' }
                ],
                'Some\'ll win, some will lose': [
                    { position: 0, chord: 'G' }
                ],
                'Some are born to sing the blues': [
                    { position: 0, chord: 'Am' },
                    { position: 18, chord: 'F' }
                ],
                'Whoa, the movie never ends': [
                    { position: 0, chord: 'C' }
                ],
                'Don\'t stop believin\'': [
                    { position: 0, chord: 'C' },
                    { position: 10, chord: 'G' }
                ],
                'Hold on to that feelin\'': [
                    { position: 0, chord: 'Am' },
                    { position: 12, chord: 'F' }
                ],
                'Hold on': [
                    { position: 0, chord: 'G' }
                ]
            }
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
            chordPositions: {
                'Sed ut perspiciatis unde omnis': [
                    { position: 0, chord: 'C' },
                    { position: 20, chord: 'G' }
                ],
                'Iste natus error sit voluptatem': [
                    { position: 0, chord: 'Am' },
                    { position: 22, chord: 'F' }
                ],
                'Ipsam voluptatem quia voluptas': [
                    { position: 0, chord: 'C' },
                    { position: 15, chord: 'G' }
                ],
                'Sit aspernatur aut odit aut': [
                    { position: 0, chord: 'Am' },
                    { position: 20, chord: 'F' }
                ]
            }
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
            chordPositions: {
                'At vero eos et accusamus': [
                    { position: 0, chord: 'C' },
                    { position: 15, chord: 'F' }
                ],
                'Et iusto odio dignissimos': [
                    { position: 0, chord: 'G' },
                    { position: 18, chord: 'C' }
                ],
                'Deleniti atque corrupti': [
                    { position: 0, chord: 'C' },
                    { position: 15, chord: 'F' }
                ],
                'Quos dolores et quas': [
                    { position: 0, chord: 'G' },
                    { position: 15, chord: 'C' }
                ]
            }
        }
    ];
}