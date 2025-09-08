#!/usr/bin/env node
/**
 * 🔥 ПОЛНОЕ ТЕСТИРОВАНИЕ HACKER LAB v2.0 🔥
 * Братский тест всех компонентов на качество
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 HACKER LAB - ELITE TESTING SUITE 🔥');
console.log('=====================================\n');

let errors = 0;
let warnings = 0;
let passed = 0;

function test(name, condition, details = '') {
    if (condition) {
        console.log(`✅ ${name}`);
        passed++;
    } else {
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
        errors++;
    }
}

function warn(name, details = '') {
    console.log(`⚠️  ${name}`);
    if (details) console.log(`   ${details}`);
    warnings++;
}

// 1. ПРОВЕРКА ФАЙЛОВОЙ СТРУКТУРЫ
console.log('📁 TESTING FILE STRUCTURE...\n');

const requiredFiles = [
    'index.html',
    'assets/js/app.js',
    'assets/js/core/state.js',
    'assets/js/core/simulator.js', 
    'assets/js/core/storage.js',
    'assets/js/core/gamification.js',
    'assets/js/ui/terminal.js',
    'assets/js/ui/sidebar.js',
    'assets/js/ui/disasm.js',
    'assets/js/ui/modal.js',
    'assets/js/ui/flow_graph.js',
    'assets/js/ui/memory_viz.js',
    'assets/data/lessons.js',
    'assets/data/lessons_tier1.js',
    'assets/data/lessons_tier2.js',
    'assets/data/lessons_tier3.js',
    'assets/data/lessons_tier4.js',
    'assets/data/lessons_bonus.js',
    'assets/css/main.css',
    'assets/css/components.css',
    'assets/css/terminal.css',
    'assets/css/elite.css',
    'assets/css/gamification.css',
    'assets/css/elite_disasm.css',
    'assets/css/flow_graph.css',
    'assets/css/memory_viz.css',
    'assets/css/concepts.css'
];

requiredFiles.forEach(file => {
    test(`File exists: ${file}`, fs.existsSync(file));
});

// 2. ПРОВЕРКА HTML
console.log('\n📄 TESTING HTML...\n');

const htmlContent = fs.readFileSync('index.html', 'utf8');
test('Has DOCTYPE', htmlContent.includes('<!DOCTYPE html>'));
test('Has CSP header', htmlContent.includes('Content-Security-Policy'));
test('Loads app.js as module', htmlContent.includes('type="module"'));
test('All CSS files linked', [
    'main.css', 'components.css', 'terminal.css', 'elite.css',
    'gamification.css', 'elite_disasm.css', 'flow_graph.css',
    'memory_viz.css', 'concepts.css'
].every(css => htmlContent.includes(css)));

// 3. ПРОВЕРКА JAVASCRIPT СИНТАКСИСА
console.log('\n🔧 TESTING JAVASCRIPT SYNTAX...\n');

const jsFiles = [
    'assets/js/app.js',
    'assets/js/core/state.js',
    'assets/js/core/simulator.js',
    'assets/js/core/storage.js', 
    'assets/js/core/gamification.js',
    'assets/js/ui/terminal.js',
    'assets/js/ui/sidebar.js',
    'assets/js/ui/disasm.js',
    'assets/js/ui/modal.js',
    'assets/js/ui/flow_graph.js',
    'assets/js/ui/memory_viz.js'
];

jsFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Проверяем основные синтаксические ошибки
        if (content.includes('export') && content.includes('import')) {
            test(`${file}: ES Module syntax`, true);
        } else {
            warn(`${file}: No ES Module syntax found`);
        }
        
        // Проверяем на очевидные ошибки
        const hasUnclosedBraces = (content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length;
        const hasUnclosedParens = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
        
        test(`${file}: Balanced braces`, !hasUnclosedBraces);
        test(`${file}: Balanced parentheses`, !hasUnclosedParens);
        
    } catch (err) {
        test(`${file}: Readable`, false, err.message);
    }
});

// 4. ПРОВЕРКА ДАННЫХ УРОКОВ
console.log('\n📚 TESTING LESSON DATA...\n');

const lessonFiles = [
    'assets/data/lessons.js',
    'assets/data/lessons_tier1.js', 
    'assets/data/lessons_tier2.js',
    'assets/data/lessons_tier3.js',
    'assets/data/lessons_tier4.js',
    'assets/data/lessons_bonus.js'
];

lessonFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        test(`${file}: Has export`, content.includes('export'));
        test(`${file}: Has lesson array`, content.includes('[') && content.includes(']'));
        
        // Проверяем JSON-like структуру
        const hasId = content.includes('"id"') || content.includes("'id'");
        const hasTitle = content.includes('"title"') || content.includes("'title'");
        test(`${file}: Has lesson structure`, hasId && hasTitle);
        
    } catch (err) {
        test(`${file}: Readable`, false, err.message);
    }
});

// 5. ПРОВЕРКА CSS
console.log('\n🎨 TESTING CSS...\n');

const cssFiles = [
    'assets/css/main.css',
    'assets/css/components.css', 
    'assets/css/terminal.css',
    'assets/css/elite.css',
    'assets/css/gamification.css',
    'assets/css/elite_disasm.css',
    'assets/css/flow_graph.css',
    'assets/css/memory_viz.css',
    'assets/css/concepts.css'
];

cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasBasicCSS = content.includes('{') && content.includes('}');
        test(`${file}: Valid CSS structure`, hasBasicCSS);
        
        // Проверяем на CSS переменные (кастомные свойства)
        if (content.includes('--')) {
            test(`${file}: Uses CSS variables`, true);
        }
    }
});

// 6. ПРОВЕРКА .QODER ПРАВИЛ
console.log('\n📋 TESTING .QODER RULES...\n');

const ruleFiles = [
    '.qoder/rules/architecture.mdc',
    '.qoder/rules/security.mdc', 
    '.qoder/rules/performance.mdc',
    '.qoder/rules/ux_ui.mdc',
    '.qoder/rules/testing.mdc'
];

ruleFiles.forEach(file => {
    test(`Rule exists: ${file}`, fs.existsSync(file));
});

// ФИНАЛЬНЫЙ ОТЧЁТ
console.log('\n' + '='.repeat(50));
console.log('🎯 FINAL REPORT:');
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Errors: ${errors}`);

if (errors === 0) {
    console.log('\n🔥 ALL TESTS PASSED! HACKER LAB IS READY TO ROCK! 🔥');
    process.exit(0);
} else {
    console.log('\n💀 SOME TESTS FAILED! CHECK ERRORS ABOVE! 💀');
    process.exit(1);
}