/**
 * Comprehensive Reverse Engineering Lessons
 * Theory, examples, and practical exercises
 */

export const FULL_LESSONS = {
    "hello_world": {
        title: "Hello World Analysis",
        difficulty: "beginner",
        theory: `
            <h2>🎯 Introduction to Reverse Engineering</h2>
            <p>Clean, professional English content for production release.</p>
        `,
        practice: `<h3>📝 Practice</h3><p>Analyze assembly code structure.</p>`,
        solution: `<h3>✅ Solution</h3><p>Entry point identification and basic RE.</p>`,
        tips: ["Use professional tools", "Follow systematic approach"]
    }
};

// Export for UI
window.FULL_LESSONS = FULL_LESSONS;
            
            <h3>Основные инструменты:</h3>
            <ul>
                <li><b>Дизассемблер</b> - превращает машинный код в ассемблер (IDA Pro, Ghidra, x64dbg)</li>
                <li><b>Отладчик</b> - позволяет пошагово выполнять программу (GDB, x64dbg, WinDbg)</li>
                <li><b>Hex-редактор</b> - для просмотра и редактирования бинарных данных</li>
                <li><b>Декомпилятор</b> - пытается восстановить высокоуровневый код</li>
            </ul>
            
            <h3>Структура ELF/PE файла:</h3>
            <pre class="code-block">
ELF Header:
  Magic:   7f 45 4c 46 (\\x7fELF)
  Class:   64-bit
  Entry:   0x401000
  
Sections:
  .text   - исполняемый код
  .data   - инициализированные данные
  .rodata - константы (строки)
  .bss    - неинициализированные данные
            </pre>
            
            <h3>Первая программа - Hello World</h3>
            <p>Классическая программа выводит строку и завершается. В ассемблере это выглядит так:</p>
            
            <pre class="code-block">
section .data
    msg db 'Hello, World!', 0xa  ; строка с переводом строки
    len equ $ - msg               ; длина строки
    
section .text
    global _start
    
_start:
    ; sys_write(stdout, msg, len)
    mov rax, 1      ; системный вызов write
    mov rdi, 1      ; stdout
    mov rsi, msg    ; адрес строки
    mov rdx, len    ; длина
    syscall
    
    ; sys_exit(0)
    mov rax, 60     ; системный вызов exit
    xor rdi, rdi    ; код возврата 0
    syscall
            </pre>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <ol>
                <li>Найдите точку входа программы (Entry Point)</li>
                <li>Определите, какая строка выводится</li>
                <li>Найдите системные вызовы write и exit</li>
                <li>Измените строку "Hello, World!" на свою</li>
            </ol>
            
            <h4>Подсказки:</h4>
            <ul>
                <li>Строки обычно находятся в секции .rodata или .data</li>
                <li>Системный вызов выполняется инструкцией syscall (Linux) или int 0x80</li>
                <li>Регистр RAX содержит номер системного вызова</li>
            </ul>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>1. Entry Point:</b> 0x401000 (смотрим в ELF header)</p>
            
            <p><b>2. Строка:</b> находится по адресу в секции .rodata</p>
            <pre>
.rodata:00402000  48 65 6C 6C 6F 2C 20 57  Hello, W
.rodata:00402008  6F 72 6C 64 21 0A 00 00  orld!...
            </pre>
            
            <p><b>3. Системные вызовы:</b></p>
            <pre>
0x401000: mov rax, 1     ; sys_write
0x401007: mov rdi, 1     ; stdout
0x40100e: lea rsi, [rip+0x1000] ; адрес строки
0x401015: mov rdx, 14    ; длина
0x40101c: syscall
            </pre>
            
            <p><b>4. Патчинг строки:</b></p>
            <p>Открываем hex-редактор, идём на адрес 0x2000 (offset в файле) и меняем байты.</p>
        `,
        tips: [
            "Используйте команду 'strings' для быстрого поиска строк",
            "В x64dbg нажмите F9 для запуска до точки останова",
            "Клавиша G позволяет перейти по адресу"
        ]
    },

    "variables": {
        title: "Understanding Variables",
        difficulty: "beginner",
        theory: `
            <h2>🔢 Переменные в памяти</h2>
            
            <h3>Типы переменных и их размещение:</h3>
            
            <table class="data-table">
                <tr>
                    <th>Тип</th>
                    <th>Размер</th>
                    <th>Расположение</th>
                    <th>Время жизни</th>
                </tr>
                <tr>
                    <td>Локальные</td>
                    <td>Varies</td>
                    <td>Stack</td>
                    <td>До выхода из функции</td>
                </tr>
                <tr>
                    <td>Глобальные</td>
                    <td>Varies</td>
                    <td>.data/.bss</td>
                    <td>Вся программа</td>
                </tr>
                <tr>
                    <td>Динамические</td>
                    <td>Varies</td>
                    <td>Heap</td>
                    <td>До free()</td>
                </tr>
                <tr>
                    <td>Статические</td>
                    <td>Varies</td>
                    <td>.data/.bss</td>
                    <td>Вся программа</td>
                </tr>
            </table>
            
            <h3>Стековые переменные:</h3>
            <pre class="code-block">
push rbp           ; сохраняем старый base pointer
mov rbp, rsp       ; устанавливаем новый frame
sub rsp, 0x20      ; выделяем 32 байта для локальных переменных

; int a = 10
mov dword [rbp-0x4], 10   ; a находится по адресу rbp-4

; int b = 20  
mov dword [rbp-0x8], 20   ; b находится по адресу rbp-8

; int c = a + b
mov eax, [rbp-0x4]         ; загружаем a в eax
add eax, [rbp-0x8]         ; добавляем b
mov [rbp-0xc], eax         ; сохраняем результат в c
            </pre>
            
            <h3>Глобальные переменные:</h3>
            <pre class="code-block">
section .data
    global_int    dd 42        ; 4 байта, инициализировано
    global_str    db "Test", 0 ; строка
    
section .bss
    buffer        resb 256     ; 256 байт, не инициализировано
    counter       resd 1       ; 4 байта для int
            </pre>
            
            <h3>Выравнивание в памяти:</h3>
            <p>Компилятор выравнивает переменные для оптимизации доступа:</p>
            <pre class="code-block">
struct Example {
    char  c;     // 1 байт  [0x00]
    // padding    // 3 байта [0x01-0x03]
    int   i;     // 4 байта [0x04-0x07]
    char  c2;    // 1 байт  [0x08]
    // padding    // 7 байт  [0x09-0x0F]
    long  l;     // 8 байт  [0x10-0x17]
}; // Итого: 24 байта вместо 14
            </pre>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <p>Дана программа с переменными:</p>
            <pre class="code-block">
int global_var = 100;

int main() {
    int local_a = 10;
    int local_b = 20;
    static int static_var = 30;
    
    int* heap_var = malloc(sizeof(int));
    *heap_var = 40;
    
    int result = local_a + local_b + static_var + *heap_var + global_var;
    
    free(heap_var);
    return result;
}
            </pre>
            
            <h4>Задания:</h4>
            <ol>
                <li>Найдите адреса всех переменных в дизассемблере</li>
                <li>Определите, в какой секции находится каждая</li>
                <li>Измените значение global_var на 200</li>
                <li>Отследите выделение и освобождение heap памяти</li>
            </ol>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>Расположение переменных:</b></p>
            <ul>
                <li><code>global_var</code> - секция .data, адрес 0x404020</li>
                <li><code>static_var</code> - секция .data, адрес 0x404024</li>
                <li><code>local_a</code> - стек, [rbp-0x4]</li>
                <li><code>local_b</code> - стек, [rbp-0x8]</li>
                <li><code>heap_var</code> - указатель на heap, адрес возвращённый malloc</li>
            </ul>
            
            <p><b>Ассемблерный код:</b></p>
            <pre class="code-block">
; local_a = 10
mov dword [rbp-0x4], 0xa

; local_b = 20  
mov dword [rbp-0x8], 0x14

; heap_var = malloc(4)
mov edi, 4
call malloc
mov [rbp-0x10], rax  ; сохраняем указатель

; *heap_var = 40
mov rax, [rbp-0x10]
mov dword [rax], 0x28
            </pre>
        `,
        tips: [
            "Используйте 'x/10x $rsp' в GDB для просмотра стека",
            "Команда 'info variables' показывает все глобальные переменные",
            "Heap allocations можно отследить через breakpoint на malloc/free"
        ]
    },

    // CONTROL FLOW MODULE
    "conditions": {
        title: "Conditional Statements",
        difficulty: "intermediate",
        theory: `
            <h2>🔀 Условные переходы и ветвления</h2>
            
            <h3>Флаги процессора x86-64:</h3>
            <table class="data-table">
                <tr>
                    <th>Флаг</th>
                    <th>Название</th>
                    <th>Условие установки</th>
                </tr>
                <tr>
                    <td>ZF</td>
                    <td>Zero Flag</td>
                    <td>Результат = 0</td>
                </tr>
                <tr>
                    <td>SF</td>
                    <td>Sign Flag</td>
                    <td>Результат отрицательный</td>
                </tr>
                <tr>
                    <td>CF</td>
                    <td>Carry Flag</td>
                    <td>Беззнаковое переполнение</td>
                </tr>
                <tr>
                    <td>OF</td>
                    <td>Overflow Flag</td>
                    <td>Знаковое переполнение</td>
                </tr>
            </table>
            
            <h3>Инструкции сравнения:</h3>
            <pre class="code-block">
CMP a, b     ; вычисляет a - b, устанавливает флаги
TEST a, b    ; вычисляет a & b, устанавливает флаги
            </pre>
            
            <h3>Условные переходы:</h3>
            <pre class="code-block">
; Беззнаковые сравнения
JE/JZ    - Jump if Equal/Zero (ZF=1)
JNE/JNZ  - Jump if Not Equal/Not Zero (ZF=0)
JA/JNBE  - Jump if Above (CF=0 и ZF=0)
JAE/JNB  - Jump if Above or Equal (CF=0)
JB/JNAE  - Jump if Below (CF=1)
JBE/JNA  - Jump if Below or Equal (CF=1 или ZF=1)

; Знаковые сравнения
JG/JNLE  - Jump if Greater (ZF=0 и SF=OF)
JGE/JNL  - Jump if Greater or Equal (SF=OF)
JL/JNGE  - Jump if Less (SF≠OF)
JLE/JNG  - Jump if Less or Equal (ZF=1 или SF≠OF)
            </pre>
            
            <h3>Паттерны if-else:</h3>
            <pre class="code-block">
// C код:
if (x > 10) {
    y = 1;
} else {
    y = 2;
}

; Ассемблер:
cmp dword [rbp-0x4], 0xa   ; сравниваем x с 10
jle .else_branch            ; если x <= 10, прыгаем на else
    mov dword [rbp-0x8], 1  ; y = 1
    jmp .end_if             ; прыгаем в конец
.else_branch:
    mov dword [rbp-0x8], 2  ; y = 2
.end_if:
            </pre>
            
            <h3>Switch-case конструкция:</h3>
            <pre class="code-block">
// C код:
switch(x) {
    case 1: func1(); break;
    case 2: func2(); break;
    case 3: func3(); break;
    default: func_default();
}

; Ассемблер (jump table):
mov eax, [rbp-0x4]         ; загружаем x
cmp eax, 3                 ; проверяем диапазон
ja .default                ; если x > 3, идём в default
lea rdx, [jump_table]      ; адрес таблицы переходов
movsxd rax, dword [rdx+rax*4] ; берём смещение
add rax, rdx               ; вычисляем адрес
jmp rax                    ; прыгаем

jump_table:
    dd case_1 - jump_table
    dd case_2 - jump_table
    dd case_3 - jump_table
            </pre>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <p>Проанализируйте функцию проверки пароля:</p>
            <pre class="code-block">
0x401100: push rbp
0x401101: mov rbp, rsp
0x401104: sub rsp, 0x20
0x401108: mov [rbp-0x8], rdi      ; сохраняем указатель на строку
0x40110c: mov rax, [rbp-0x8]
0x401110: movzx eax, byte [rax]   ; первый символ
0x401113: cmp al, 0x41            ; сравниваем с 'A'
0x401115: jne .fail
0x401117: mov rax, [rbp-0x8]
0x40111b: movzx eax, byte [rax+1] ; второй символ
0x40111f: cmp al, 0x42            ; сравниваем с 'B'
0x401121: jne .fail
0x401123: mov rax, [rbp-0x8]
0x401127: movzx eax, byte [rax+2] ; третий символ
0x40112b: cmp al, 0x43            ; сравниваем с 'C'
0x40112d: jne .fail
0x40112f: mov eax, 1              ; успех
0x401134: jmp .end
0x401136: .fail:
0x401136: xor eax, eax            ; неудача
0x401138: .end:
0x401138: leave
0x401139: ret
            </pre>
            
            <h4>Вопросы:</h4>
            <ol>
                <li>Какой пароль принимает функция?</li>
                <li>Перепишите логику на C</li>
                <li>Как обойти проверку?</li>
                <li>Оптимизируйте код</li>
            </ol>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>1. Пароль:</b> "ABC" (0x41, 0x42, 0x43)</p>
            
            <p><b>2. Код на C:</b></p>
            <pre class="code-block">
int check_password(char* input) {
    if (input[0] != 'A') return 0;
    if (input[1] != 'B') return 0;
    if (input[2] != 'C') return 0;
    return 1;
}
            </pre>
            
            <p><b>3. Способы обхода:</b></p>
            <ul>
                <li>Патчим JNE на JMP (всегда переходим)</li>
                <li>Меняем JNE на NOP (никогда не переходим)</li>
                <li>Патчим возвращаемое значение (MOV EAX, 1)</li>
            </ul>
            
            <p><b>4. Оптимизированная версия:</b></p>
            <pre class="code-block">
mov eax, [rdi]         ; загружаем 4 байта
and eax, 0xFFFFFF      ; маскируем 3 байта
cmp eax, 0x434241      ; сравниваем с "ABC" (little-endian)
sete al                ; устанавливаем результат
movzx eax, al          ; расширяем до int
ret
            </pre>
        `,
        tips: [
            "Используйте IDA Pro для автоматического распознавания switch tables",
            "В GDB команда 'info registers' показывает все флаги",
            "Плагин x64dbg 'Conditional Branch Logger' помогает анализировать ветвления"
        ]
    },

    "loops": {
        title: "Loop Structures",
        difficulty: "intermediate", 
        theory: `
            <h2>🔄 Циклы в ассемблере</h2>
            
            <h3>Типы циклов и их паттерны:</h3>
            
            <h4>1. For Loop:</h4>
            <pre class="code-block">
// C код:
for (int i = 0; i < 10; i++) {
    array[i] = i * 2;
}

; Ассемблер:
xor ecx, ecx           ; i = 0
.for_loop:
    cmp ecx, 10        ; i < 10?
    jge .end_loop      ; если i >= 10, выходим
    
    mov eax, ecx       ; eax = i
    shl eax, 1         ; eax = i * 2
    mov [rbx+rcx*4], eax ; array[i] = eax
    
    inc ecx            ; i++
    jmp .for_loop      ; повторяем
.end_loop:
            </pre>
            
            <h4>2. While Loop:</h4>
            <pre class="code-block">
// C код:
while (x > 0) {
    x = x / 2;
    count++;
}

; Ассемблер:
.while_loop:
    cmp dword [rbp-0x4], 0  ; x > 0?
    jle .end_while          ; если x <= 0, выходим
    
    mov eax, [rbp-0x4]      ; eax = x
    sar eax, 1              ; x = x / 2 (arithmetic shift)
    mov [rbp-0x4], eax      ; сохраняем x
    
    inc dword [rbp-0x8]     ; count++
    jmp .while_loop         ; повторяем
.end_while:
            </pre>
            
            <h4>3. Do-While Loop:</h4>
            <pre class="code-block">
// C код:
do {
    sum += array[i];
    i++;
} while (i < size);

; Ассемблер:
.do_while:
    mov eax, [rbp-0x4]      ; eax = i
    mov edx, [rbx+rax*4]    ; edx = array[i]
    add [rbp-0x8], edx      ; sum += edx
    
    inc dword [rbp-0x4]     ; i++
    
    mov eax, [rbp-0x4]      ; eax = i
    cmp eax, [rbp-0xc]      ; i < size?
    jl .do_while            ; если да, повторяем
            </pre>
            
            <h3>Оптимизации циклов:</h3>
            
            <h4>Loop Unrolling (развёртка):</h4>
            <pre class="code-block">
; Обычный цикл (4 итерации)
mov ecx, 4
.loop:
    add eax, [rbx]
    add rbx, 4
    dec ecx
    jnz .loop

; Развёрнутый цикл
add eax, [rbx]
add eax, [rbx+4]
add eax, [rbx+8]
add eax, [rbx+12]
            </pre>
            
            <h4>SIMD оптимизация:</h4>
            <pre class="code-block">
; Обработка 4 float одновременно
movaps xmm0, [rsi]      ; загружаем 4 float
mulps xmm0, xmm1        ; умножаем все 4
movaps [rdi], xmm0      ; сохраняем результат
            </pre>
            
            <h3>Специальные инструкции для циклов:</h3>
            <pre class="code-block">
LOOP  - декремент ECX и переход если ECX != 0
LOOPE - декремент ECX и переход если ECX != 0 И ZF = 1
LOOPNE - декремент ECX и переход если ECX != 0 И ZF = 0
REP   - повторять пока ECX != 0
REPE  - повторять пока ECX != 0 И ZF = 1
REPNE - повторять пока ECX != 0 И ZF = 0
            </pre>
            
            <h3>Поиск в строке с REP:</h3>
            <pre class="code-block">
; Поиск символа в строке
mov al, 'X'          ; ищем символ 'X'
mov rdi, string_addr ; адрес строки
mov rcx, string_len  ; длина строки
repne scasb         ; сканируем пока не найдём
je found            ; если нашли (ZF=1)
            </pre>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <p>Дан алгоритм хеширования строки:</p>
            <pre class="code-block">
0x401200: push rbp
0x401201: mov rbp, rsp
0x401204: mov rsi, rdi         ; rsi = строка
0x401207: xor eax, eax         ; hash = 0
0x401209: xor ecx, ecx         ; i = 0
0x40120b: .loop:
0x40120b: movzx edx, byte [rsi+rcx] ; dl = str[i]
0x40120f: test dl, dl          ; конец строки?
0x401211: jz .done
0x401213: imul eax, eax, 31    ; hash *= 31
0x401216: add eax, edx         ; hash += str[i]
0x401218: inc ecx              ; i++
0x401219: jmp .loop
0x40121b: .done:
0x40121b: pop rbp
0x40121c: ret
            </pre>
            
            <h4>Задания:</h4>
            <ol>
                <li>Определите алгоритм хеширования</li>
                <li>Напишите эквивалент на C</li>
                <li>Найдите коллизию (две строки с одинаковым хешем)</li>
                <li>Оптимизируйте код используя SIMD</li>
            </ol>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>1. Алгоритм:</b> Java String hashCode (полиномиальный хеш)</p>
            
            <p><b>2. Код на C:</b></p>
            <pre class="code-block">
int hash_string(const char* str) {
    int hash = 0;
    while (*str) {
        hash = hash * 31 + *str;
        str++;
    }
    return hash;
}
            </pre>
            
            <p><b>3. Поиск коллизий:</b></p>
            <p>Из-за переполнения int32, коллизии существуют. Пример:</p>
            <ul>
                <li>"FB" и "Ea" дают одинаковый хеш</li>
                <li>Формула: если h(s1) == h(s2), то h(s1 + X) == h(s2 + X)</li>
            </ul>
            
            <p><b>4. SIMD оптимизация:</b></p>
            <pre class="code-block">
; Обработка 4 символов за раз
movd xmm0, [rsi]        ; загружаем 4 байта
pmovzxbd xmm0, xmm0     ; расширяем до dword
movdqa xmm1, [multipliers] ; 31^3, 31^2, 31^1, 31^0
pmulld xmm0, xmm1       ; умножаем
phaddd xmm0, xmm0       ; горизонтальное сложение
phaddd xmm0, xmm0
movd eax, xmm0          ; результат в eax
            </pre>
        `,
        tips: [
            "Используйте команду 'display/i $pc' в GDB для автоматического показа текущей инструкции",
            "Loop-carried dependencies часто мешают оптимизации",
            "Intel VTune помогает найти горячие циклы в программе"
        ]
    },

    // MEMORY MODULE
    "stack_frame": {
        title: "Stack Frame Analysis",
        difficulty: "intermediate",
        theory: `
            <h2>📚 Стековые фреймы и соглашения вызова</h2>
            
            <h3>Структура стекового фрейма:</h3>
            <pre class="code-block">
High Address
+------------------+
| Return Address   | <- Адрес возврата из функции
+------------------+
| Saved RBP        | <- Сохранённый base pointer
+------------------+ <- RBP указывает сюда
| Local Variable 1 | [RBP-8]
+------------------+
| Local Variable 2 | [RBP-16]
+------------------+
| ...              |
+------------------+ <- RSP указывает сюда
Low Address
            </pre>
            
            <h3>Пролог и эпилог функции:</h3>
            <pre class="code-block">
; Пролог (Function Prologue)
push rbp           ; Сохраняем старый base pointer
mov rbp, rsp       ; Устанавливаем новый base pointer
sub rsp, 0x20      ; Выделяем место для локальных переменных

; ... тело функции ...

; Эпилог (Function Epilogue)
mov rsp, rbp       ; Восстанавливаем stack pointer (или leave)
pop rbp            ; Восстанавливаем base pointer
ret                ; Возвращаемся по адресу на стеке
            </pre>
            
            <h3>Calling Conventions (x86-64 System V ABI):</h3>
            <table class="data-table">
                <tr>
                    <th>Аргумент</th>
                    <th>Регистр</th>
                    <th>Тип</th>
                </tr>
                <tr><td>1</td><td>RDI</td><td>Integer/Pointer</td></tr>
                <tr><td>2</td><td>RSI</td><td>Integer/Pointer</td></tr>
                <tr><td>3</td><td>RDX</td><td>Integer/Pointer</td></tr>
                <tr><td>4</td><td>RCX</td><td>Integer/Pointer</td></tr>
                <tr><td>5</td><td>R8</td><td>Integer/Pointer</td></tr>
                <tr><td>6</td><td>R9</td><td>Integer/Pointer</td></tr>
                <tr><td>7+</td><td>Stack</td><td>Все типы</td></tr>
                <tr><td>Float 1-8</td><td>XMM0-XMM7</td><td>Float/Double</td></tr>
                <tr><td>Return</td><td>RAX/XMM0</td><td>Integer/Float</td></tr>
            </table>
            
            <h3>Windows x64 Calling Convention:</h3>
            <pre class="code-block">
; Первые 4 аргумента: RCX, RDX, R8, R9
; Shadow space: 32 байта резервируется на стеке
; Пример вызова функции с 5 аргументами:

sub rsp, 0x28      ; 32 байта shadow + 8 для выравнивания
mov rcx, arg1      ; 1-й аргумент
mov rdx, arg2      ; 2-й аргумент
mov r8, arg3       ; 3-й аргумент
mov r9, arg4       ; 4-й аргумент
mov [rsp+0x20], arg5 ; 5-й аргумент на стеке
call function
add rsp, 0x28      ; Очищаем стек
            </pre>
            
            <h3>Red Zone (Linux x64):</h3>
            <p>128 байт ниже RSP зарезервированы для временных данных:</p>
            <pre class="code-block">
; Можно использовать без изменения RSP
mov [rsp-8], rax   ; Сохраняем в red zone
mov [rsp-16], rbx  ; Ещё одно значение
; ...
mov rax, [rsp-8]   ; Восстанавливаем
            </pre>
            
            <h3>Stack Canary (защита от переполнения):</h3>
            <pre class="code-block">
push rbp
mov rbp, rsp
sub rsp, 0x20
mov rax, fs:0x28    ; Загружаем canary из TLS
mov [rbp-8], rax    ; Сохраняем на стеке

; ... тело функции ...

mov rax, [rbp-8]    ; Загружаем canary со стека
xor rax, fs:0x28    ; Сравниваем с оригиналом
jnz .stack_check_fail ; Если не совпадает - stack overflow!
leave
ret

.stack_check_fail:
call __stack_chk_fail
            </pre>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <p>Проанализируйте рекурсивную функцию:</p>
            <pre class="code-block">
0x401300: push rbp
0x401301: mov rbp, rsp
0x401304: sub rsp, 0x10
0x401308: mov [rbp-0x8], edi    ; сохраняем n
0x40130b: cmp dword [rbp-0x8], 1
0x40130f: jg .recursive_case
0x401311: mov eax, 1            ; базовый случай: return 1
0x401316: jmp .end
0x401318: .recursive_case:
0x401318: mov eax, [rbp-0x8]
0x40131b: sub eax, 1
0x40131e: mov edi, eax          ; n-1
0x401320: call 0x401300         ; рекурсивный вызов
0x401325: mov edx, [rbp-0x8]    
0x401328: imul eax, edx         ; результат * n
0x40132b: .end:
0x40132b: leave
0x40132c: ret
            </pre>
            
            <h4>Задания:</h4>
            <ol>
                <li>Что вычисляет функция?</li>
                <li>Нарисуйте стек для вызова с аргументом 3</li>
                <li>Найдите максимальную глубину рекурсии до stack overflow</li>
                <li>Перепишите без рекурсии</li>
            </ol>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>1. Функция вычисляет факториал:</b> n!</p>
            
            <p><b>2. Стек при вызове factorial(3):</b></p>
            <pre>
            factorial(3)          factorial(2)          factorial(1)
            +-----------+         +-----------+         +-----------+
RSP+0x20 -> | ret addr  |         | ret addr  |         | ret addr  |
            +-----------+         +-----------+         +-----------+
RSP+0x18 -> | saved rbp |         | saved rbp |         | saved rbp |
            +-----------+         +-----------+         +-----------+
RSP+0x10 -> | n = 3     |         | n = 2     |         | n = 1     |
            +-----------+         +-----------+         +-----------+
RSP+0x08 -> | padding   |         | padding   |         | padding   |
            +-----------+         +-----------+         +-----------+
RSP      -> |           |         |           |         |           |
            </pre>
            
            <p><b>3. Максимальная глубина:</b></p>
            <p>При размере стека 8MB и фрейме ~32 байта: ~250,000 вызовов</p>
            
            <p><b>4. Итеративная версия:</b></p>
            <pre class="code-block">
int factorial_iterative(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

; Ассемблер:
mov eax, 1          ; result = 1
mov ecx, 2          ; i = 2
.loop:
    cmp ecx, edi    ; i <= n?
    jg .done
    imul eax, ecx   ; result *= i
    inc ecx         ; i++
    jmp .loop
.done:
    ret
            </pre>
        `,
        tips: [
            "Используйте 'bt' в GDB для просмотра всего call stack",
            "Команда 'info frame' показывает детали текущего фрейма",
            "ROP chains используют адреса возврата для выполнения кода"
        ]
    },

    // ADVANCED MODULE
    "function_hooking": {
        title: "Function Hooking",
        difficulty: "advanced",
        theory: `
            <h2>🎣 Перехват функций (Hooking)</h2>
            
            <h3>Типы хуков:</h3>
            
            <h4>1. IAT (Import Address Table) Hooking:</h4>
            <pre class="code-block">
// Структура IAT в PE файле
IMAGE_IMPORT_DESCRIPTOR {
    OriginalFirstThunk  // RVA к Import Name Table
    TimeDateStamp
    ForwarderChain
    Name               // RVA к имени DLL
    FirstThunk         // RVA к Import Address Table
}

// Патчим адрес в IAT
void* GetIATAddress(const char* dll, const char* func) {
    HMODULE base = GetModuleHandle(NULL);
    IMAGE_DOS_HEADER* dos = (IMAGE_DOS_HEADER*)base;
    IMAGE_NT_HEADERS* nt = (IMAGE_NT_HEADERS*)((BYTE*)base + dos->e_lfanew);
    IMAGE_IMPORT_DESCRIPTOR* imports = (IMAGE_IMPORT_DESCRIPTOR*)
        ((BYTE*)base + nt->OptionalHeader.DataDirectory[1].VirtualAddress);
    
    // Ищем нужную DLL и функцию...
}
            </pre>
            
            <h4>2. Inline Hooking (Detour):</h4>
            <pre class="code-block">
; Оригинальная функция:
MessageBoxA:
    mov r10, rcx      ; оригинальный код
    mov eax, 0x123    ; оригинальный код
    ...

; После установки хука:
MessageBoxA:
    jmp MyHookFunction  ; 5 байт (E9 XX XX XX XX)
    nop                 ; padding если нужно
    ...

; Наш хук:
MyHookFunction:
    ; Наш код
    push rcx
    push rdx
    call LogFunction
    pop rdx
    pop rcx
    
    ; Выполняем оригинальные инструкции
    mov r10, rcx
    mov eax, 0x123
    
    ; Прыгаем обратно
    jmp MessageBoxA+7
            </pre>
            
            <h4>3. VTable Hooking (для C++ объектов):</h4>
            <pre class="code-block">
class IInterface {
    virtual void Method1() = 0;
    virtual void Method2() = 0;
};

// VTable в памяти:
// +0x00: указатель на Method1
// +0x08: указатель на Method2

// Хукаем:
void** vtable = *(void***)object;
DWORD oldProtect;
VirtualProtect(vtable, sizeof(void*) * 2, PAGE_READWRITE, &oldProtect);
originalMethod1 = vtable[0];
vtable[0] = &MyHookedMethod1;  // Подменяем указатель
VirtualProtect(vtable, sizeof(void*) * 2, oldProtect, &oldProtect);
            </pre>
            
            <h4>4. Syscall Hooking:</h4>
            <pre class="code-block">
; Windows syscall
NtCreateFile:
    mov r10, rcx
    mov eax, 55h      ; Syscall number
    syscall
    ret

; Linux syscall hook через ptrace
ptrace(PTRACE_SYSCALL, pid, 0, 0);  // Остановка на syscall
wait(&status);
ptrace(PTRACE_GETREGS, pid, 0, &regs);  // Читаем регистры
if (regs.orig_rax == SYS_open) {
    // Модифицируем аргументы или результат
}
            </pre>
            
            <h3>Трамплин (Trampoline):</h3>
            <pre class="code-block">
// Создаём трамплин для вызова оригинальной функции
void* CreateTrampoline(void* original) {
    void* trampoline = VirtualAlloc(NULL, 32, MEM_COMMIT, PAGE_EXECUTE_READWRITE);
    
    // Копируем первые инструкции
    memcpy(trampoline, original, 14);  // Минимум 5 байт для jmp
    
    // Добавляем прыжок на продолжение оригинальной функции
    *(BYTE*)(trampoline + 14) = 0xE9;  // JMP
    *(DWORD*)(trampoline + 15) = (DWORD)((BYTE*)original + 14 - (BYTE*)trampoline - 19);
    
    return trampoline;
}
            </pre>
            
            <h3>Защита от хуков:</h3>
            <ul>
                <li><b>CRC проверка:</b> Проверка контрольной суммы кода функции</li>
                <li><b>Direct syscalls:</b> Обход user-mode хуков</li>
                <li><b>Anti-debug:</b> Обнаружение отладчиков</li>
                <li><b>Obfuscation:</b> Затруднение анализа</li>
            </ul>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <p>Установите хук на функцию malloc для подсчёта аллокаций:</p>
            
            <pre class="code-block">
#include <stdio.h>
#include <stdlib.h>

int allocation_count = 0;
void* (*original_malloc)(size_t) = NULL;

void* hooked_malloc(size_t size) {
    allocation_count++;
    printf("[HOOK] Allocation #%d: %zu bytes\\n", allocation_count, size);
    // Вызов оригинальной функции
    return original_malloc(size);
}

int main() {
    // TODO: Установить хук на malloc
    
    // Тестовый код
    void* p1 = malloc(100);
    void* p2 = malloc(200);
    void* p3 = malloc(300);
    
    printf("Total allocations: %d\\n", allocation_count);
    
    free(p1);
    free(p2);
    free(p3);
    
    return 0;
}
            </pre>
            
            <h4>Задания:</h4>
            <ol>
                <li>Реализуйте IAT hook для malloc</li>
                <li>Реализуйте inline hook с трамплином</li>
                <li>Добавьте логирование в файл</li>
                <li>Перехватите free и проверяйте на double-free</li>
            </ol>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>1. LD_PRELOAD хук (Linux):</b></p>
            <pre class="code-block">
#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdio.h>

static int count = 0;
static void* (*real_malloc)(size_t) = NULL;

void* malloc(size_t size) {
    if (!real_malloc) {
        real_malloc = dlsym(RTLD_NEXT, "malloc");
    }
    
    count++;
    fprintf(stderr, "[HOOK] Allocation #%d: %zu bytes\\n", count, size);
    
    return real_malloc(size);
}

// Компиляция: gcc -shared -fPIC hook.c -o hook.so -ldl
// Использование: LD_PRELOAD=./hook.so ./program
            </pre>
            
            <p><b>2. Inline hook с MinHook (Windows):</b></p>
            <pre class="code-block">
#include <MinHook.h>

void* (*fpMalloc)(size_t) = NULL;

void* DetourMalloc(size_t size) {
    allocation_count++;
    printf("[HOOK] Malloc: %zu bytes\\n", size);
    return fpMalloc(size);  // Вызов через трамплин
}

void InstallHook() {
    MH_Initialize();
    MH_CreateHook(&malloc, &DetourMalloc, (LPVOID*)&fpMalloc);
    MH_EnableHook(&malloc);
}
            </pre>
            
            <p><b>3. Проверка double-free:</b></p>
            <pre class="code-block">
#include <unordered_set>

std::unordered_set<void*> freed_pointers;

void hooked_free(void* ptr) {
    if (freed_pointers.count(ptr)) {
        printf("[ERROR] Double free detected: %p\\n", ptr);
        abort();
    }
    freed_pointers.insert(ptr);
    original_free(ptr);
}
            </pre>
        `,
        tips: [
            "Используйте Detours library от Microsoft для Windows hooking",
            "frida - мощный фреймворк для динамического анализа",
            "strace/ltrace показывают системные вызовы и library calls"
        ]
    },

    "anti_debugging": {
        title: "Anti-Debugging Techniques",
        difficulty: "advanced",
        theory: `
            <h2>🛡️ Антиотладочные техники</h2>
            
            <h3>1. Проверка флагов отладки:</h3>
            
            <h4>Windows - PEB (Process Environment Block):</h4>
            <pre class="code-block">
; Проверка BeingDebugged флага
mov rax, gs:[60h]    ; PEB в x64
movzx eax, byte [rax+2]  ; BeingDebugged
test eax, eax
jnz debugger_detected

; Проверка NtGlobalFlag
mov rax, gs:[60h]
mov eax, [rax+0BCh]  ; NtGlobalFlag
and eax, 70h         ; FLG_HEAP_*, FLG_STACK_*
test eax, eax
jnz debugger_detected
            </pre>
            
            <h4>Linux - TracerPid:</h4>
            <pre class="code-block">
// Чтение /proc/self/status
char line[256];
FILE* f = fopen("/proc/self/status", "r");
while (fgets(line, sizeof(line), f)) {
    if (strncmp(line, "TracerPid:", 10) == 0) {
        int pid = atoi(line + 10);
        if (pid != 0) {
            // Отладчик обнаружен
        }
    }
}
            </pre>
            
            <h3>2. Timing checks:</h3>
            <pre class="code-block">
; RDTSC - Read Time-Stamp Counter
rdtsc
mov r8, rax
mov r9, rdx

; Защищённый код
call protected_function

rdtsc
sub rax, r8
sbb rdx, r9
; Если разница > threshold, отладчик обнаружен
cmp rax, 0x100000
ja debugger_detected
            </pre>
            
            <h3>3. Breakpoint detection:</h3>
            <pre class="code-block">
; Проверка на INT3 (0xCC)
mov rsi, function_to_check
mov ecx, function_size
.scan_loop:
    lodsb
    cmp al, 0xCC
    je breakpoint_found
    loop .scan_loop

; Проверка на аппаратные breakpoints (DR0-DR3)
mov rax, dr0
or rax, dr1
or rax, dr2
or rax, dr3
test rax, rax
jnz hardware_bp_found
            </pre>
            
            <h3>4. Exception-based detection:</h3>
            <pre class="code-block">
; Установка SEH handler
push .exception_handler
push fs:[0]
mov fs:[0], rsp

; Генерируем исключение
xor eax, eax
div eax  ; Division by zero

; Если мы здесь - отладчик перехватил исключение
jmp debugger_detected

.exception_handler:
    ; Нормальный путь выполнения
    mov eax, [esp+0Ch]  ; CONTEXT
    add dword [eax+0B8h], 2  ; Skip div instruction
    xor eax, eax  ; ExceptionContinueExecution
    ret
            </pre>
            
            <h3>5. Self-modifying code:</h3>
            <pre class="code-block">
; Расшифровка кода во время выполнения
mov rsi, encrypted_code
mov rdi, rsi
mov rcx, code_size
mov al, 0x42  ; XOR key
.decrypt_loop:
    xor [rsi], al
    inc rsi
    loop .decrypt_loop

; Теперь код расшифрован и может выполняться
jmp encrypted_code
            </pre>
            
            <h3>6. API hooks detection:</h3>
            <pre class="code-block">
// Проверка первых байтов функции
BYTE* func = (BYTE*)GetProcAddress(GetModuleHandle("ntdll.dll"), "NtQueryInformationProcess");
if (func[0] == 0xE9 || func[0] == 0xFF) {
    // Hook detected (JMP instruction)
}

// Сравнение с чистой копией из файла
HANDLE file = CreateFile("C:\\\\Windows\\\\System32\\\\ntdll.dll", ...);
// Читаем и сравниваем...
            </pre>
            
            <h3>7. Virtual machine detection:</h3>
            <pre class="code-block">
; CPUID для определения гипервизора
mov eax, 1
cpuid
test ecx, 80000000h  ; Hypervisor bit
jnz vm_detected

; Проверка специфичных для VM строк
mov eax, 40000000h
cpuid
; EBX, ECX, EDX содержат "KVMKVMKVM" для KVM
; или "VMwareVMware" для VMware
            </pre>
            
            <h3>Обход антиотладки:</h3>
            <ul>
                <li>Патчинг проверок (NOP или JMP)</li>
                <li>Хуки на API функции проверки</li>
                <li>Использование hypervisor-based отладчиков</li>
                <li>ScyllaHide плагин для x64dbg</li>
            </ul>
        `,
        practice: `
            <h3>📝 Практическое задание</h3>
            
            <p>Реализуйте многоуровневую защиту:</p>
            <pre class="code-block">
#include <stdio.h>
#include <windows.h>

void secret_function() {
    printf("Secret unlocked!\\n");
}

int main() {
    // TODO: Добавить минимум 3 антиотладочные проверки
    
    // Защищённый код
    int key = 0;
    printf("Enter key: ");
    scanf("%d", &key);
    
    if (key == 1337) {
        secret_function();
    }
    
    return 0;
}
            </pre>
            
            <h4>Задания:</h4>
            <ol>
                <li>Добавьте проверку IsDebuggerPresent</li>
                <li>Реализуйте timing check с RDTSC</li>
                <li>Добавьте проверку на breakpoints</li>
                <li>Обфусцируйте проверку ключа</li>
                <li>Обойдите свою же защиту</li>
            </ol>
        `,
        solution: `
            <h3>✅ Решение</h3>
            
            <p><b>Полная реализация защиты:</b></p>
            <pre class="code-block">
#include <intrin.h>

// Anti-debug macro
#define ANTI_DEBUG() do { \\
    if (IsDebuggerPresent()) exit(1); \\
    if (CheckRemoteDebuggerPresent(GetCurrentProcess(), &dbg) && dbg) exit(1); \\
    if (timing_check()) exit(1); \\
} while(0)

bool timing_check() {
    unsigned __int64 start = __rdtsc();
    Sleep(100);  // Нормально ~100ms
    unsigned __int64 end = __rdtsc();
    
    // При отладке будет намного больше
    return (end - start) > 500000000;
}

bool check_breakpoints() {
    BYTE* addr = (BYTE*)secret_function;
    for (int i = 0; i < 100; i++) {
        if (addr[i] == 0xCC) return true;  // INT3
    }
    return false;
}

// Обфусцированная проверка
bool check_key(int input) {
    int magic = 0x539;  // 1337 в hex
    magic = ((magic << 2) | (magic >> 30));  // ROL 2
    magic ^= 0xDEADBEEF;
    magic = ((magic << 2) | (magic >> 30));
    magic ^= 0xDEADBEEF;
    
    int transformed = input;
    transformed = ((transformed << 2) | (transformed >> 30));
    transformed ^= 0xDEADBEEF;
    transformed = ((transformed << 2) | (transformed >> 30));
    transformed ^= 0xDEADBEEF;
    
    return magic == transformed;
}

int main() {
    BOOL dbg = FALSE;
    
    ANTI_DEBUG();
    
    if (check_breakpoints()) {
        printf("Breakpoint detected!\\n");
        exit(1);
    }
    
    // XOR encrypted code
    BYTE encrypted[] = {0x1F, 0x2E, 0x3D, ...};  // XOR'ed opcodes
    for (int i = 0; i < sizeof(encrypted); i++) {
        encrypted[i] ^= 0x42;
    }
    
    // Execute decrypted code
    void (*func)() = (void(*)())encrypted;
    func();
    
    return 0;
}
            </pre>
            
            <p><b>Обход защиты:</b></p>
            <ol>
                <li>Патчим IsDebuggerPresent: <code>mov eax, 0; ret</code></li>
                <li>Хукаем __rdtsc для фейковых значений</li>
                <li>Используем hardware breakpoints вместо INT3</li>
                <li>Анализируем обфускацию статически</li>
            </ol>
        `,
        tips: [
            "TitanHide - kernel driver для обхода антиотладки",
            "x64dbg + ScyllaHide обходит большинство проверок",
            "Используйте VM snapshots для быстрого восстановления"
        ]
    }
};

// Экспорт для использования в UI
window.FULL_LESSONS = FULL_LESSONS;
