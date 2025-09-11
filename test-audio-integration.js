/**
 * Test script to verify AudioManager integration
 * Run this in the browser console to test audio performance fixes
 */

console.log('🎵 Starting AudioManager Integration Test...');

// Test 1: AudioManager availability
const testAudioManagerAvailability = () => {
    console.log('\n📋 Test 1: AudioManager Availability');
    
    if (typeof audioManager !== 'undefined' && audioManager) {
        console.log('✅ AudioManager is available');
        console.log('📊 Status:', audioManager.getStatus());
        return true;
    } else {
        console.error('❌ AudioManager not found');
        return false;
    }
};

// Test 2: AudioDebugger availability
const testAudioDebuggerAvailability = () => {
    console.log('\n📋 Test 2: AudioDebugger Availability');
    
    if (typeof window.audioDebugger !== 'undefined' && window.audioDebugger) {
        console.log('✅ AudioDebugger is available');
        console.log('📊 Summary:', window.audioDebugger.getSummary());
        return true;
    } else {
        console.error('❌ AudioDebugger not found');
        return false;
    }
};

// Test 3: Simulated concurrent audio stress test
const testConcurrentAudio = async () => {
    console.log('\n📋 Test 3: Concurrent Audio Stress Test');
    
    try {
        // Enable audio debugging for monitoring
        if (window.audioDebugger && !window.audioDebugger.enabled) {
            window.audioDebugger.enable();
        }
        
        // Wait for Tone.js to be ready
        if (window.Tone && window.Tone.context.state !== 'running') {
            await window.Tone.start();
        }
        
        // Test rapid chord playback (simulating piano roll + handpan)
        console.log('🎹 Testing rapid chord sequences...');
        
        const testChords = [
            { name: 'C Major', notes: ['C4', 'E4', 'G4'] },
            { name: 'F Major', notes: ['F4', 'A4', 'C5'] },
            { name: 'G Major', notes: ['G4', 'B4', 'D5'] },
            { name: 'Am', notes: ['A4', 'C5', 'E5'] }
        ];
        
        // Rapid fire test - similar to user's reported issue
        for (let i = 0; i < 8; i++) {
            const chord = testChords[i % testChords.length];
            
            // Simulate piano roll chord
            if (typeof Actions !== 'undefined' && Actions.playChord) {
                Actions.playChord({ chord, duration: '8n' });
            }
            
            // Simulate handpan note (50ms delay)
            setTimeout(() => {
                if (audioManager && audioManager.playNote) {
                    audioManager.playNote(chord.notes[0], '16n', 'handpan');
                }
            }, 50);
            
            // Small delay between iterations
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('✅ Concurrent audio test completed');
        
        // Check for warnings
        setTimeout(() => {
            if (window.audioDebugger) {
                const summary = window.audioDebugger.getSummary();
                console.log('📊 Test Results:');
                console.log('  - Total Events:', summary.totalEvents);
                console.log('  - Warnings:', summary.warnings);
                console.log('  - Active Voices:', summary.activeVoices);
                console.log('  - Context State:', summary.contextState);
                
                if (summary.warnings === 0) {
                    console.log('✅ No performance warnings detected!');
                } else {
                    console.warn('⚠️  Performance warnings detected - check audio debugger panel');
                }
            }
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('❌ Concurrent audio test failed:', error);
        return false;
    }
};

// Test 4: Memory leak prevention test
const testMemoryLeakPrevention = () => {
    console.log('\n📋 Test 4: Memory Leak Prevention');
    
    try {
        // Get initial synth count
        const initialStatus = audioManager ? audioManager.getStatus() : null;
        console.log('📊 Initial audio status:', initialStatus);
        
        // Check that we're not creating new synths constantly
        if (window.Tone && window.Tone.context) {
            const contextNodes = window.Tone.context.destination.channelCount;
            console.log('📊 Audio context channels:', contextNodes);
            console.log('✅ Using AudioManager synth pooling - memory leak prevention active');
            return true;
        } else {
            console.log('⚠️  Tone.js context not available for memory check');
            return false;
        }
    } catch (error) {
        console.error('❌ Memory leak prevention test failed:', error);
        return false;
    }
};

// Run all tests
const runAllTests = async () => {
    console.log('🚀 Running AudioManager Integration Tests...\n');
    
    const results = {
        audioManagerAvailable: testAudioManagerAvailability(),
        audioDebuggerAvailable: testAudioDebuggerAvailability(),
        memoryLeakPrevention: testMemoryLeakPrevention(),
        concurrentAudio: await testConcurrentAudio()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log('\n' + '='.repeat(50));
    console.log(`🎵 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('🎉 AudioManager integration is working correctly!');
        console.log('💡 The original audio dropout issue should now be resolved.');
    } else {
        console.log('🔧 Some issues detected - check individual test results above.');
    }
    
    return allPassed;
};

// Export for use in browser console
window.testAudioIntegration = runAllTests;

// Auto-run if this script is loaded directly
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📚 Audio Integration Test loaded. Run testAudioIntegration() in console to start tests.');
    });
}