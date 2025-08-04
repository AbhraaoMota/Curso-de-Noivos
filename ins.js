import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let inscritos = [];

// Toggle menu (caso tenha)
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }
});

// Verifica senha
window.verificarSenha = () => {
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro-senha");

  if (senha === "adminjuva") {
    erro.style.display = "none";
    document.getElementById("senha-area").classList.add("hidden");
    document.getElementById("titulo-senha").classList.add("hidden");
    document.getElementById("conteudo").classList.remove("hidden");
    carregarInscritos();
  } else {
    erro.style.display = "block";
  }
};

// Carrega inscritos e monta tabela
async function carregarInscritos() {
  const tbody = document.querySelector("#tabela-inscritos tbody");
  tbody.innerHTML = "";
  inscritos = [];

  const querySnapshot = await getDocs(collection(db, "inscritos"));

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const dataFormatada = data.data?.toDate?.().toLocaleDateString("pt-BR") ?? "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.nome}</td>
      <td>${data.nome_conj}</td>
      <td>${data.telefone}</td>
      <td>${data.email}</td>
      <td>${data.igreja}</td>
      <td>${data.estado_civil}</td>
      <td>${data.forma_pagamento ?? "—"}</td>
      <td>${dataFormatada}</td>
    `;
    tbody.appendChild(tr);

    inscritos.push({
      Nome: data.nome,
      Conjuge: data.nome_conj,
      Telefone: data.telefone,
      Email: data.email,
      Igreja: data.igreja,
      Estado_Civil: data.estado_civil,
      Pagamento: data.forma_pagamento ?? "—",
      Data: dataFormatada
    });
  });

  // Atualiza contador de inscritos
  const total = inscritos.length;
  const totalSpan = document.getElementById("total-inscritos");
  const vagasSpan = document.getElementById("vagas-restantes");

  if (totalSpan) totalSpan.textContent = total;
  if (vagasSpan) vagasSpan.textContent = 160 - total;
}

// Exportar PDF
window.exportarPDF = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Lista de Inscritos", 15, 20);

  doc.setFontSize(12);
  doc.text(`Total de inscritos: ${inscritos.length}`, 15, 28);

  const headers = [["Nome", "Cônjuge", "Telefone", "Email", "Igreja", "Estado Civil", "Pagamento", "Data"]];
  const rows = inscritos.map(i => [
    i.Nome, i.Conjuge, i.Telefone, i.Email, i.Igreja, i.Estado_Civil, i.Pagamento, i.Data
  ]);

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 35,
    styles: {
      fontSize: 10,
      textColor: [255, 255, 255],
      lineColor: [92, 59, 50],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [123, 82, 72],
      textColor: 255,
      lineColor: [92, 59, 50],
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
    },
    margin: { left: 10, right: 10 }
  });

  doc.save("inscritos.pdf");
};
