import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCHNATCJ5yvvETOAdsdwKI2ig7Hetn0urQ",
  authDomain: "noivos-inscricao.firebaseapp.com",
  projectId: "noivos-inscricao",
  storageBucket: "noivos-inscricao.appspot.com",
  messagingSenderId: "97800294490",
  appId: "1:97800294490:web:b486f8668f02ca4125c863"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector(".formulario");
  const confirmacao = document.querySelector(".confirmacao");

  // Máscara de telefone (XX) XXXXX-XXXX
  const telefoneInput = document.querySelector('input[name="telefone"]');
  if (telefoneInput) {
    telefoneInput.addEventListener("input", () => {
      let valor = telefoneInput.value.replace(/\D/g, "");
      if (valor.length > 11) valor = valor.slice(0, 11);
      if (valor.length >= 2 && valor.length <= 6) {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
      } else if (valor.length > 6) {
        valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
      }
      telefoneInput.value = valor;
    });
  }

  // 👉 Limite de inscrições
  const LIMITE_INSCRITOS = 160;
  const inscritosRef = collection(db, "inscritos");
  const snapshot = await getDocs(inscritosRef);
  const totalInscritos = snapshot.size;

  if (totalInscritos >= LIMITE_INSCRITOS) {
    const aviso = document.getElementById("aviso-limite");
    if (aviso) aviso.classList.remove("hidden");
    form.classList.add("hidden");
    return;
  }

  // Verifica se já existe inscrição no localStorage
  if (localStorage.getItem("inscrito") === "true") {
    const email = localStorage.getItem("email");

    if (email) {
      const q = query(inscritosRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        localStorage.clear();
        location.reload();
        return;
      }

      form.classList.add("hidden");
      confirmacao.classList.remove("hidden");
    } else {
      localStorage.clear();
      location.reload();
    }
  }

  // 🚀 Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = e.target.nome.value.toUpperCase();
    const nome_conj = e.target.nome_conj.value.toUpperCase();
    const telefone = e.target.telefone.value;
    const email = e.target.email.value.trim().toLowerCase(); // normaliza email
    const igreja = e.target.igreja.value.toUpperCase();
    const estado_civil = e.target.estado_civil.value.toUpperCase();
    const forma_pagamento = e.target.forma_pagamento.value.toUpperCase();

    try {
      // 🔍 Verifica se já existe esse email cadastrado
      const q = query(inscritosRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("⚠️ Este e-mail já está cadastrado.");
        return;
      }

      // Cria documento novo sempre
      await addDoc(inscritosRef, {
        nome,
        nome_conj,
        telefone,
        email,
        igreja,
        estado_civil,
        forma_pagamento,
        data: new Date()
      });

      // Envia email de confirmação
      await emailjs.send("service_xy6m14t", "template_oyzfclf", {
        nome,
        nome_conj,
        telefone,
        email,
        igreja,
        estado_civil,
        forma_pagamento
      });

      // Salva no localStorage
      localStorage.setItem("inscrito", "true");
      localStorage.setItem("email", email);
      localStorage.setItem("nome", nome);
      localStorage.setItem("nome_conj", nome_conj);
      localStorage.setItem("telefone", telefone);
      localStorage.setItem("igreja", igreja);
      localStorage.setItem("estado_civil", estado_civil);
      localStorage.setItem("forma_pagamento", forma_pagamento);

      alert("✅ Inscrição concluída!");
      location.reload();
    } catch (err) {
      console.error("Erro:", err);
      alert("❌ Erro ao enviar inscrição.");
    }
  });

  // Toggle menu mobile
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }
});

// Reenvio de e-mail
window.reenviarEmail = async () => {
  const email = localStorage.getItem("email");
  const nome = localStorage.getItem("nome");
  const telefone = localStorage.getItem("telefone");
  const igreja = localStorage.getItem("igreja");
  const estado_civil = localStorage.getItem("estado_civil");
  const nome_conj = localStorage.getItem("nome_conj");
  const forma_pagamento = localStorage.getItem("forma_pagamento");

  if (!email) return alert("❌ Nenhum cadastro encontrado.");

  try {
    await emailjs.send("service_xy6m14t", "template_oyzfclf", {
      nome,
      nome_conj,
      telefone,
      email,
      igreja,
      estado_civil,
      forma_pagamento
    });

    alert("📨 E-mail reenviado com sucesso!");
  } catch (err) {
    console.error("Erro ao reenviar:", err);
    alert("❌ Falha ao reenviar e-mail.");
  }
};

// Exclusão de cadastro
window.excluirCadastro = async () => {
  const email = localStorage.getItem("email");

  if (!email) return alert("❌ Nenhum cadastro encontrado para excluir.");

  try {
    const inscritosRef = collection(db, "inscritos");
    const q = query(inscritosRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("⚠️ Cadastro já foi removido.");
      localStorage.clear();
      location.reload();
      return;
    }

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "inscritos", docSnap.id));
    }

    localStorage.clear();
    alert("✅ Cadastro excluído com sucesso.");
    location.reload();
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert("❌ Erro ao excluir o cadastro.");
  }
};
