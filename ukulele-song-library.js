export default class UkuleleSongLibrary {
    static songs = [
        {
            id: 'lorem-song-1',
            title: 'Lorem Melody',
            artist: 'Sample Artist',
            key: 'C',
            difficulty: 'beginner',
            genre: 'folk',
            tempo: 120,
            chordProgression: ['C', 'Am', 'F', 'G'],
            strummingPattern: 'D-D-U-U-D-U',
            strummingNotes: 'Down-Down-Up-Up-Down-Up pattern, repeat for each chord',
            tags: ['beginner-friendly', 'practice'],
            lyrics: `[Verse 1]
Lorem ipsum dolor sit amet
Consectetur adipiscing elit
Sed do eiusmod tempor incididunt
Ut labore et dolore magna

[Chorus]  
Aliqua enim ad minim veniam
Quis nostrud exercitation
Ullamco laboris nisi ut aliquip
Ex ea commodo consequat

[Verse 2]
Duis aute irure dolor in
Reprehenderit in voluptate velit
Esse cillum dolore eu fugiat
Nulla pariatur excepteur sint

[Chorus]
Aliqua enim ad minim veniam
Quis nostrud exercitation
Ullamco laboris nisi ut aliquip
Ex ea commodo consequat`,
            chordPositions: {
                'Lorem ipsum dolor sit amet': [
                    { position: 0, chord: 'C' },
                    { position: 18, chord: 'Am' }
                ],
                'Consectetur adipiscing elit': [
                    { position: 0, chord: 'F' },
                    { position: 20, chord: 'G' }
                ],
                'Aliqua enim ad minim veniam': [
                    { position: 0, chord: 'C' },
                    { position: 15, chord: 'Am' }
                ],
                'Quis nostrud exercitation': [
                    { position: 0, chord: 'F' },
                    { position: 18, chord: 'G' }
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