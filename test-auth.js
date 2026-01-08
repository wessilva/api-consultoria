/**
 * Script para testar as rotas de Registro e Login da API
 * 
 * Como usar:
 * 1. Instale o node-fetch: npm install node-fetch@2
 * 2. Edite a variável API_URL com a URL da sua API online
 * 3. Execute: node test-auth.js
 */

const fetch = require('node-fetch');

// ⚠️ SUBSTITUA PELA URL DA SUA API NO RENDER
const API_URL = 'https://api-consultoria-production.up.railway.app';

// Dados para teste
const testUser = {
  name: 'Teste Usuario',
  email: `teste${Date.now()}@exemplo.com`, // Email único a cada execução
  password: 'senha123456'
};

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para testar o registro
async function testRegister() {
  log('\n═══════════════════════════════════════', 'blue');
  log('🧪 TESTE 1: REGISTRO DE USUÁRIO', 'blue');
  log('═══════════════════════════════════════\n', 'blue');
  
  try {
    log(`📤 Enviando requisição POST para ${API_URL}/register`);
    log(`📦 Dados: ${JSON.stringify(testUser, null, 2)}\n`);
    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok) {
      log('✅ REGISTRO BEM-SUCEDIDO!', 'green');
      log(`📊 Status: ${response.status}`, 'green');
      log(`📋 Resposta:`, 'green');
      console.log(JSON.stringify(data, null, 2));
      return data;
    } else {
      log('❌ ERRO NO REGISTRO!', 'red');
      log(`📊 Status: ${response.status}`, 'red');
      log(`📋 Resposta:`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    log('❌ ERRO DE CONEXÃO!', 'red');
    log(`Erro: ${error.message}`, 'red');
    return null;
  }
}

// Função para testar o login
async function testLogin() {
  log('\n═══════════════════════════════════════', 'blue');
  log('🧪 TESTE 2: LOGIN DE USUÁRIO', 'blue');
  log('═══════════════════════════════════════\n', 'blue');
  
  try {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    log(`📤 Enviando requisição POST para ${API_URL}/login`);
    log(`📦 Dados: ${JSON.stringify(loginData, null, 2)}\n`);
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    if (response.ok) {
      log('✅ LOGIN BEM-SUCEDIDO!', 'green');
      log(`📊 Status: ${response.status}`, 'green');
      log(`📋 Resposta:`, 'green');
      console.log(JSON.stringify(data, null, 2));
      log(`\n🔑 Token JWT gerado com sucesso!`, 'yellow');
      log(`Token: ${data.token?.substring(0, 50)}...`, 'yellow');
      return data;
    } else {
      log('❌ ERRO NO LOGIN!', 'red');
      log(`📊 Status: ${response.status}`, 'red');
      log(`📋 Resposta:`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    log('❌ ERRO DE CONEXÃO!', 'red');
    log(`Erro: ${error.message}`, 'red');
    return null;
  }
}

// Função para testar login com credenciais inválidas
async function testInvalidLogin() {
  log('\n═══════════════════════════════════════', 'blue');
  log('🧪 TESTE 3: LOGIN COM SENHA INCORRETA', 'blue');
  log('═══════════════════════════════════════\n', 'blue');
  
  try {
    const invalidLoginData = {
      email: testUser.email,
      password: 'senhaErrada123'
    };
    
    log(`📤 Enviando requisição POST para ${API_URL}/login`);
    log(`📦 Dados: ${JSON.stringify(invalidLoginData, null, 2)}\n`);
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidLoginData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      log('✅ TESTE PASSOU! Credenciais inválidas foram rejeitadas corretamente.', 'green');
      log(`📊 Status: ${response.status}`, 'green');
      log(`📋 Resposta:`, 'green');
      console.log(JSON.stringify(data, null, 2));
    } else {
      log('❌ FALHA NO TESTE! Login deveria ter sido rejeitado.', 'red');
      log(`📊 Status: ${response.status}`, 'red');
    }
  } catch (error) {
    log('❌ ERRO DE CONEXÃO!', 'red');
    log(`Erro: ${error.message}`, 'red');
  }
}

// Executar todos os testes
async function runAllTests() {
  log('\n🚀 INICIANDO TESTES DA API DE AUTENTICAÇÃO', 'yellow');
  log(`🌐 URL da API: ${API_URL}`, 'yellow');
  log(`⏰ Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`, 'yellow');

  // Teste 1: Registro
  const registerResult = await testRegister();
  
  if (registerResult) {
    // Aguarda 1 segundo entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 2: Login
    const loginResult = await testLogin();
    
    if (loginResult) {
      // Aguarda 1 segundo entre os testes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Teste 3: Login inválido
      await testInvalidLogin();
    }
  }

  log('\n═══════════════════════════════════════', 'yellow');
  log('✨ TESTES CONCLUÍDOS!', 'yellow');
  log('═══════════════════════════════════════\n', 'yellow');
}

// Executar
runAllTests();
