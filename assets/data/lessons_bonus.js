/**
 * 🎁 BONUS LESSONS 
 * Заполняем промежутки и добавляем специальные уроки
 */

export const BonusLessons = [
    // ========== СПЕЦИАЛЬНЫЕ ЧЕЛЛЕНДЖИ ==========
    {
        id: 'daily.1',
        title: '⚡ Daily Challenge: Speed Run',
        desc: 'Complete assembly task under 60 seconds',
        level: 5,
        xp: 300,
        difficulty: 'timed',
        skills: ['speed', 'optimization', 'efficiency'],
        content: `
# Daily Challenge: Speed Run ⚡⏱️

## Your Mission
Complete this assembly challenge as FAST as possible!
⏰ **Time Limit: 60 seconds**

## Speed Tips
- Use shortcuts: \`si\` instead of \`stepi\`
- Remember common patterns
- Don't overthink - trust your instincts!
- Use autocomplete when possible

## The Challenge
Write the fastest possible solution to calculate Fibonacci sequence.

Remember: Elite hackers code at the speed of thought! 🧠💨
`,
        code: `
section .text
global _start

_start:
    ; Calculate 10th Fibonacci number (should be 55)
    ; F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
    
    ; Your ultra-fast implementation here!
    ; Goal: Get 55 in RAX in minimum instructions
    
    ; Hint: Can you do it in under 15 instructions?
    
    ret
`,
        objective: '⚡ Calculate F(10) = 55 in under 15 instructions',
        hints: [
            'Use registers efficiently: RAX, RBX for F(n-1), F(n-2)',
            'Loop 10 times with RCX counter',
            'Unroll first few iterations manually'
        ],
        check: (state) => state.regs.rax === 55n,
        timeLimit: 60 // seconds
    },
    
    {
        id: 'ctf.1',
        title: '🏴‍☠️ CTF: Find The Flag',
        desc: 'Real CTF-style challenge with hidden flag',
        level: 8,
        xp: 800,
        difficulty: 'ctf',
        skills: ['ctf', 'flag_hunting', 'forensics'],
        content: `
# CTF Challenge: Hidden Flag 🏴‍☠️🔍

## Your Mission
Find the hidden flag in this assembly code!

## Flag Format
\`HTB{something_here}\`

## Hunting Tips
- Check string literals
- Look for encoded data
- Examine hex dumps
- Try different decoding methods
- Think outside the box!

## Scoring
- First blood: +500 XP bonus
- Under 10 minutes: +200 XP  
- No hints used: +300 XP

Good luck, flag hunter! 🎯
`,
        code: `
section .data
    ; Suspicious strings
    str1: db "Welcome to the challenge!", 0
    str2: db "Nothing to see here...", 0
    
    ; Some numbers
    magic: dq 0x7B425448, 0x335F7234, 0x645F6D30, 0x7D363373
    
    ; XOR key
    key: db 0x13, 0x37, 0x42, 0xAB
    
section .bss
    decoded: resb 32
    
section .text
global _start

decode_flag:
    ; Decode the magic numbers
    lea rdi, [magic]
    lea rsi, [decoded]
    mov rcx, 32              ; 4 qwords = 32 bytes
    xor rbx, rbx             ; Key index
    
decode_loop:
    mov al, [rdi]
    mov dl, [key + rbx]
    xor al, dl
    mov [rsi], al
    
    inc rdi
    inc rsi
    inc rbx
    and rbx, 3               ; Wrap key index
    loop decode_loop
    
    ret

_start:
    ; Decode the flag
    call decode_flag
    
    ; Flag is now in 'decoded' buffer
    ; Format: HTB{r3v3rs3_m4573r}
    
    ; Success verification
    mov rax, [decoded]       ; Should start with "HTB{"
    mov rbx, [decoded + 8]   ; Middle part
    mov rcx, [decoded + 16]  ; End part
    
    ; Simple check: first 4 bytes should be "HTB{"
    cmp eax, 0x7B425448      ; "HTB{" in little endian
    je flag_found
    
    mov rax, 0
    jmp done
    
flag_found:
    mov rax, 0xFLAG          ; Success!
    
done:
    ret
`,
        objective: '🏴‍☠️ Find and decode the hidden flag',
        hints: [
            'The magic array contains encoded data',
            'Try XOR decoding with the provided key',
            'The result should be a readable flag'
        ],
        strings: ['HTB{r3v3rs3_m4573r}', 'flag', 'challenge'],
        check: (state) => (state.regs.rax & 0xFFFFFFFFn) === 0x474C4146n // "FLAG"
    },
    
    {
        id: 'puzzle.1',
        title: '🧩 Logic Puzzle: The Maze',
        desc: 'Navigate through conditional jumps',
        level: 6,
        xp: 450,
        difficulty: 'puzzle',
        skills: ['logic', 'debugging', 'problem_solving'],
        content: `
# Logic Puzzle: The Assembly Maze 🧩🌀

## The Challenge
Navigate through a maze of conditional jumps to reach the exit!

## Rules
- You start at the entrance
- Each room has a condition to check
- Wrong path leads to dead ends
- Only one path leads to the treasure!

## Navigation Commands
- Check register values before each decision
- Use conditional jumps wisely
- Trace your path carefully

## The Maze Layout
\`\`\`
  [START] → [Room1] → [Room2] → [EXIT]
     ↓         ↓         ↓
  [Dead1]   [Dead2]   [Dead3]
\`\`\`

Can you find the correct path? 🗺️💎
`,
        code: `
section .text
global _start

_start:
    ; Welcome to the maze!
    mov rax, 100            ; Starting value
    mov rbx, 42             ; Magic number
    
entrance:
    ; Room 1: Choice based on RAX
    cmp rax, 50
    jl dead_end_1           ; Wrong path!
    cmp rax, 150  
    jg dead_end_1           ; Also wrong!
    
    ; Correct path: modify RAX
    add rax, rbx            ; RAX = 100 + 42 = 142
    
room_1:
    ; Room 2: Choice based on RBX
    cmp rbx, 40
    jl dead_end_2
    cmp rbx, 45
    jg dead_end_2
    
    ; Correct path: modify RBX
    shl rbx, 1              ; RBX = 42 * 2 = 84
    
room_2:
    ; Room 3: Final challenge
    mov rcx, rax
    add rcx, rbx            ; RCX = 142 + 84 = 226
    
    cmp rcx, 200
    jl dead_end_3
    cmp rcx, 250
    jg dead_end_3
    
    ; SUCCESS! Found the treasure
    mov rax, 0x7265617375726521  ; "treasure!"
    jmp maze_exit
    
dead_end_1:
    mov rax, 0xDEAD1
    jmp maze_exit
    
dead_end_2:
    mov rax, 0xDEAD2  
    jmp maze_exit
    
dead_end_3:
    mov rax, 0xDEAD3
    
maze_exit:
    ; Challenge: Navigate to get "treasure!" in RAX
    ret
`,
        objective: '🧩 Navigate the maze to get the treasure',
        hints: [
            'Follow the logic carefully',
            'Each room modifies values for the next',
            'All conditions must pass to reach treasure'
        ],
        check: (state) => state.regs.rax === 0x7265617375726521n
    },
    
    {
        id: 'challenge.1',
        title: '🔥 Elite Challenge: Crypto Cracker',
        desc: 'Break a multi-stage encryption',
        level: 12,
        xp: 1500,
        difficulty: 'elite',
        skills: ['cryptanalysis', 'reverse_engineering', 'pattern_recognition'],
        content: `
# Elite Challenge: Multi-Stage Crypto 🔥🔐

## The Scenario
You've intercepted encrypted communications from a suspicious organization. 
Intelligence suggests they're using a custom 3-stage encryption:

1. **Stage 1**: Caesar cipher with unknown shift
2. **Stage 2**: XOR with rotating key  
3. **Stage 3**: Base64-like encoding

## Your Mission
Reverse engineer the decryption algorithm and recover the original message.

## Advanced Techniques Required
- Frequency analysis
- Known plaintext attacks  
- Pattern recognition
- Cryptographic reverse engineering

## Intelligence Notes
- The message likely contains the word "OPERATION"
- Final result should be readable English
- Multiple decoding stages required

This is what separates script kiddies from elite hackers! 🎯💀
`,
        code: `
section .data
    ; Intercepted encrypted message (3 stages of encryption)
    encrypted: db 0x4E, 0x7A, 0x4D, 0x5F, 0x7C, 0x4A, 0x5B, 0x7F
               db 0x4C, 0x59, 0x6E, 0x41, 0x78, 0x4F, 0x5D, 0x71
    enc_len: equ 16
    
    ; Possible Caesar shifts to try
    shifts: db 1, 3, 5, 7, 11, 13, 17, 19, 23
    
    ; XOR keys to try
    xor_keys: db 0x1A, 0x2B, 0x3C, 0x4D
              db 0x7F, 0x6E, 0x5D, 0x4C
    
section .bss
    stage1_buf: resb 32
    stage2_buf: resb 32
    final_buf: resb 32
    
section .text
global _start

; Stage 1: Caesar cipher decode
caesar_decode:
    push rbp
    mov rbp, rsp
    
    ; RDI = input, RSI = output, RDX = length, RCX = shift
    push rcx
    push rdx
    
caesar_loop:
    movzx rax, byte [rdi]
    
    ; Apply reverse Caesar shift
    sub rax, rcx
    
    ; Handle wraparound for letters
    cmp rax, 'A'
    jl caesar_wrap_up
    cmp rax, 'Z'
    jle caesar_store
    
    ; Lowercase check
    cmp rax, 'a'
    jl caesar_store
    cmp rax, 'z'
    jle caesar_store
    
caesar_wrap_up:
    add rax, 26             ; Wrap around alphabet
    
caesar_store:
    mov [rsi], al
    inc rdi
    inc rsi
    dec rdx
    jnz caesar_loop
    
    pop rdx
    pop rcx
    pop rbp
    ret

; Stage 2: XOR decode
xor_decode:
    push rbp
    mov rbp, rsp
    
    ; RDI = input, RSI = output, RDX = length, RCX = key_addr
    xor rbx, rbx            ; Key index
    
xor_loop:
    movzx rax, byte [rdi]
    movzx r8, byte [rcx + rbx]
    
    xor rax, r8
    mov [rsi], al
    
    inc rdi
    inc rsi
    inc rbx
    and rbx, 3              ; 4-byte key wraparound
    dec rdx
    jnz xor_loop
    
    pop rbp
    ret

; Stage 3: Custom base64-like decode
base64_decode:
    push rbp
    mov rbp, rsp
    
    ; Simple substitution decode
    ; RDI = input, RSI = output, RDX = length
    
b64_loop:
    movzx rax, byte [rdi]
    
    ; Custom alphabet decode
    sub rax, 0x20           ; Adjust base
    and rax, 0x3F           ; 6-bit mask
    
    ; Map back to ASCII
    cmp rax, 26
    jl b64_letter_upper
    cmp rax, 52
    jl b64_letter_lower
    cmp rax, 62
    jl b64_digit
    ; Handle special chars...
    
b64_letter_upper:
    add rax, 'A'
    jmp b64_store
    
b64_letter_lower:
    sub rax, 26
    add rax, 'a'
    jmp b64_store
    
b64_digit:
    sub rax, 52
    add rax, '0'
    
b64_store:
    mov [rsi], al
    inc rdi
    inc rsi
    dec rdx
    jnz b64_loop
    
    pop rbp
    ret

; Brute force decoder
crack_encryption:
    push rbp
    mov rbp, rsp
    
    ; Try different Caesar shifts
    mov r12, 0               ; Shift index
    
try_shift:
    cmp r12, 9
    jge crack_failed
    
    ; Get shift value
    movzx rcx, byte [shifts + r12]
    
    ; Try Caesar decode
    lea rdi, [encrypted]
    lea rsi, [stage1_buf]
    mov rdx, enc_len
    call caesar_decode
    
    ; Try different XOR keys
    mov r13, 0               ; Key index
    
try_xor_key:
    cmp r13, 2
    jge next_shift
    
    ; Get XOR key address
    lea rcx, [xor_keys + r13 * 4]
    
    ; XOR decode
    lea rdi, [stage1_buf]
    lea rsi, [stage2_buf]
    mov rdx, enc_len
    call xor_decode
    
    ; Base64 decode
    lea rdi, [stage2_buf]
    lea rsi, [final_buf]
    mov rdx, enc_len
    call base64_decode
    
    ; Check if result contains "OPERATION"
    call check_for_operation
    test rax, rax
    jnz crack_success
    
    inc r13
    jmp try_xor_key
    
next_shift:
    inc r12
    jmp try_shift
    
crack_success:
    mov rax, 0x434F4D504C455445  ; "COMPLETE"
    jmp crack_done
    
crack_failed:
    mov rax, 0xFAILED
    
crack_done:
    pop rbp
    ret

; Check if decoded text contains "OPERATION"
check_for_operation:
    push rbp
    mov rbp, rsp
    
    ; Simple string search for "OPERATION"
    lea rdi, [final_buf]
    mov rcx, enc_len - 9      ; Search range
    
search_loop:
    ; Check if current position matches "OPERATION"
    mov rax, [rdi]           ; First 8 bytes
    cmp rax, 0x4E4F495441524550  ; "OPERATIO" 
    je operation_found
    
    inc rdi
    loop search_loop
    
    xor rax, rax             ; Not found
    jmp search_done
    
operation_found:
    mov rax, 1               ; Found!
    
search_done:
    pop rbp
    ret

_start:
    ; Challenge: Break the 3-stage encryption
    call crack_encryption
    
    ; Success: RAX contains "COMPLETE"
    ret
`,
        objective: '🔓 Break the encryption and find "OPERATION"',
        hints: [
            'Try different combinations of Caesar shifts and XOR keys',
            'Look for readable English in the result',
            'The word "OPERATION" should appear in plaintext'
        ],
        check: (state) => (state.regs.rax & 0xFFFFFFFFFFFFFFFFn) === 0x434F4D504C455445n
    },
    
    {
        id: 'tutorial.advanced',
        title: '🎓 Advanced Tutorial: Real-World Malware',
        desc: 'Analyze simplified malware sample',
        level: 15,
        xp: 2000,
        difficulty: 'tutorial',
        skills: ['malware_analysis', 'real_world', 'static_analysis'],
        content: `
# Real-World Malware Analysis 🦠🔬

## Scenario
You're a malware analyst at a security company. A suspicious executable was flagged by your EDR system.

## Sample Information
- **File**: suspicious.exe
- **Size**: 2048 bytes
- **Detection**: Trojan.Generic
- **Behavior**: Network activity, registry modification

## Analysis Objectives
1. Identify the malware family
2. Extract C2 domains  
3. Understand persistence mechanism
4. Document IOCs (Indicators of Compromise)

## Professional Approach
- Static analysis first (safer)
- Dynamic analysis in sandbox
- Document everything
- Prepare mitigation strategies

## Real-World Impact
This type of analysis:
- Protects organizations
- Enables threat hunting
- Develops detection signatures
- Supports incident response

Welcome to professional malware analysis! 🛡️💼
`,
        code: `
section .data
    ; Simulated malware strings (obfuscated)
    domain1: db 0x6D, 0x61, 0x6C, 0x77, 0x61, 0x72, 0x65  ; "malware"
             db 0x2D, 0x63, 0x32, 0x2E, 0x63, 0x6F, 0x6D, 0 ; "-c2.com"
    
    ; Registry persistence
    reg_path: db "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", 0
    reg_name: db "WindowsSecurityUpdate", 0
    
    ; Encrypted payload
    payload: db 0xFC, 0x48, 0x83, 0xE4, 0xF0, 0xE8, 0xC0
             db 0x00, 0x00, 0x00, 0x41, 0x51, 0x41, 0x50
    
    ; XOR key for payload
    xor_key: db 0x13, 0x37, 0x42, 0xAB
    
section .bss
    decrypted_payload: resb 64
    ioc_list: resb 256
    
section .text
global _start

; Extract IOCs (Indicators of Compromise)
extract_iocs:
    push rbp
    mov rbp, rsp
    
    ; Extract domain strings
    lea rsi, [domain1]
    lea rdi, [ioc_list]
    
    ; Copy domain to IOC list
    mov rcx, 15              ; Domain length
    rep movsb
    
    ; Add separator
    mov byte [rdi], 0x0A     ; Newline
    inc rdi
    
    ; Extract registry path
    lea rsi, [reg_path]
    mov rcx, 45              ; Registry path length
    rep movsb
    
    pop rbp
    ret

; Decrypt malware payload
decrypt_payload:
    push rbp
    mov rbp, rsp
    
    mov rcx, 14              ; Payload length
    xor rbx, rbx             ; Key index
    lea rsi, [payload]
    lea rdi, [decrypted_payload]
    
decrypt_loop:
    movzx rax, byte [rsi]
    movzx rdx, byte [xor_key + rbx]
    
    xor rax, rdx
    mov [rdi], al
    
    inc rsi
    inc rdi
    inc rbx
    and rbx, 3               ; Key wraparound
    loop decrypt_loop
    
    pop rbp
    ret

; Analyze malware behavior
analyze_malware:
    push rbp
    mov rbp, rsp
    
    ; Stage 1: Extract IOCs
    call extract_iocs
    
    ; Stage 2: Decrypt payload
    call decrypt_payload
    
    ; Stage 3: Classify malware family
    ; Check for common malware signatures
    
    ; Look for shellcode patterns
    mov rax, [decrypted_payload]
    cmp eax, 0xE4834CF0      ; Common shellcode prologue
    je shellcode_detected
    
    ; Look for network indicators
    lea rdi, [domain1]
    mov al, 'c'
    mov rcx, 15
    repne scasb
    je c2_detected
    
    ; Default classification
    mov rax, 0x4D414C574152       ; "MALWAR"
    jmp analysis_done
    
shellcode_detected:
    mov rax, 0x5348454C4C434F44   ; "SHELLCOD"
    jmp analysis_done
    
c2_detected:
    mov rax, 0x545241505045522    ; "TRAPPER" (trojan)
    
analysis_done:
    pop rbp
    ret

_start:
    ; Professional malware analysis workflow
    
    ; Initialize analysis
    xor rax, rax
    
    ; Perform analysis
    call analyze_malware
    
    ; Verify analysis results
    ; Success: Identified as TRAPPER (C2 trojan)
    cmp rax, 0x545241505045522
    je analysis_success
    
    mov rax, 0
    jmp analysis_exit
    
analysis_success:
    mov rax, 0x414E414C59534953   ; "ANALYSIS" - Professional analysis complete!
    
analysis_exit:
    ret
`,
        objective: '🦠 Complete professional malware analysis',
        hints: [
            'Follow the analysis workflow step by step',
            'Extract IOCs first, then decrypt payload',
            'Classify based on behavioral indicators'
        ],
        strings: ['malware-c2.com', 'ANALYSIS', 'TRAPPER', 'OPERATION'],
        check: (state) => state.regs.rax === 0x414E414C59534953n
    },
    
    {
        id: 'community.1',
        title: '👥 Community Challenge: Team Effort',
        desc: 'Collaborative problem solving',
        level: 10,
        xp: 600,
        difficulty: 'collaborative',
        skills: ['teamwork', 'communication', 'knowledge_sharing'],
        content: `
# Community Challenge: Team Effort 👥🤝

## The Mission
This challenge requires multiple people working together!

## Team Roles
- **Analyst**: Understands the algorithm
- **Coder**: Implements the solution  
- **Tester**: Validates the results
- **Leader**: Coordinates the effort

## Collaboration Tools
- Shared workspace
- Code comments for communication
- Progress tracking
- Knowledge sharing

## The Challenge
Implement a distributed hash cracking algorithm where each team member handles different parts.

## Community Benefits
- Learn from others
- Share knowledge
- Build professional network
- Develop teamwork skills

Together we are stronger! 💪🌟
`,
        code: `
section .data
    ; Hash to crack: Simple MD5-like (simplified for demo)
    target_hash: db 0x5D, 0x41, 0xA2, 0x13, 0xE6, 0x89, 0x33, 0x77
    
    ; Dictionary for brute force
    charset: db "abcdefghijklmnopqrstuvwxyz0123456789", 0
    charset_len: equ 36
    
    ; Team member assignments (4-char passwords)
    team_ranges: 
        ; Member 1: aaaa-azzz
        dq 0x61616161, 0x617A7A7A
        ; Member 2: baaa-bzzz  
        dq 0x62616161, 0x627A7A7A
        ; Member 3: caaa-czzz
        dq 0x63616161, 0x637A7A7A
        ; Member 4: daaa-dzzz
        dq 0x64616161, 0x647A7A7A
    
section .bss
    current_attempt: resb 8
    hash_result: resb 8
    
section .text
global _start

; Simple hash function (not real MD5)
simple_hash:
    push rbp
    mov rbp, rsp
    
    ; RDI = input string, RSI = output hash
    mov rcx, 4               ; 4-char input
    xor rax, rax             ; Hash accumulator
    xor rbx, rbx             ; Multiplier
    
hash_loop:
    movzx rdx, byte [rdi]
    
    ; Simple hash: sum with rotation
    rol rax, 7
    add rax, rdx
    xor rax, rbx
    inc rbx
    
    inc rdi
    loop hash_loop
    
    mov [rsi], rax           ; Store result
    
    pop rbp
    ret

; Team member 1's assignment
crack_range_1:
    push rbp
    mov rbp, rsp
    
    ; Try passwords starting with 'a'
    mov byte [current_attempt], 'a'
    mov byte [current_attempt + 1], 'a'
    mov byte [current_attempt + 2], 'a'
    mov byte [current_attempt + 3], 'a'
    
    ; Simplified: just try "admin"
    mov dword [current_attempt], 'nima'  ; "amin" backwards due to endianness
    
    ; Hash the attempt
    lea rdi, [current_attempt]
    lea rsi, [hash_result]
    call simple_hash
    
    ; Check if matches target
    mov rax, [hash_result]
    mov rbx, [target_hash]
    cmp rax, rbx
    je password_found
    
    xor rax, rax
    jmp crack_done
    
password_found:
    mov rax, 0x464F554E44        ; "FOUND"
    
crack_done:
    pop rbp
    ret

_start:
    ; Simulate team member 1's work
    call crack_range_1
    
    ; Check if password was cracked
    cmp rax, 0x464F554E44
    je team_success
    
    mov rax, 0
    jmp team_exit
    
team_success:
    mov rax, 0x5445414D574F524B  ; "TEAMWORK"
    
team_exit:
    ret
`,
        objective: '👥 Successfully coordinate team effort to crack hash',
        hints: [
            'Each team member has a specific range to check',
            'Communication is key in team challenges',
            'Share progress and coordinate efforts'
        ],
        check: (state) => state.regs.rax === 0x5445414D574F524Bn
    }
];

