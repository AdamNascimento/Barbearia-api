import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:3000";

function App() {
  const [aba, setAba] = useState("agendamentos");

  // --- Agendamentos ---
  const [agendamentos, setAgendamentos] = useState([]);
  const [nome, setNome] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState(null);
  const [filtroData, setFiltroData] = useState("");
  const [filtroBarbeiro, setFiltroBarbeiro] = useState("");

  // --- Villa Clube ---
  const [assinantes, setAssinantes] = useState([]);
  const [assNome, setAssNome] = useState("");
  const [assTelefone, setAssTelefone] = useState("");
  const [assPlano, setAssPlano] = useState("Master");
  const [assInicio, setAssInicio] = useState("");
  const [assVencimento, setAssVencimento] = useState("");
  const [assMessage, setAssMessage] = useState({ type: "", text: "" });
  const [showDeleteAssModal, setShowDeleteAssModal] = useState(false);
  const [assinanteToDelete, setAssinanteToDelete] = useState(null);

  // --- Configurações ---
  const [servicosOptions, setServicosOptions] = useState([]);
  const [pagamentoOptions, setPagamentoOptions] = useState([]);
  const [barbeirosOptions, setBarbeirosOptions] = useState([]);
  const [horariosConfig, setHorariosConfig] = useState({ hora_inicio: "08:00", hora_fim: "20:00", intervalo_minutos: 30 });
  const [servicosRaw, setServicosRaw] = useState([]);
  const [pagamentosRaw, setPagamentosRaw] = useState([]);
  const [barbeirosRaw, setBarbeirosRaw] = useState([]);
  const [novoServico, setNovoServico] = useState("");
  const [novoPagamento, setNovoPagamento] = useState("");
  const [novoBarbeiro, setNovoBarbeiro] = useState("");
  const [configMessage, setConfigMessage] = useState({ type: "", text: "" });

  const statusOptions = ["Pendente", "Confirmado", "Concluído", "Cancelado"];
  const planosOptions = ["Master", "Sênior", "Premium", "Master MAX", "Sênior MAX", "Premium MAX"];

  // Gera horários dinamicamente com base na configuração do banco
  const generateTimeOptions = () => {
    const times = [];
    const [startH] = horariosConfig.hora_inicio.split(":").map(Number);
    const [endH] = horariosConfig.hora_fim.split(":").map(Number);
    const intervalo = horariosConfig.intervalo_minutos;
    for (let i = startH; i <= endH; i++) {
      for (let j = 0; j < 60; j += intervalo) {
        if (i === endH && j > 0) break;
        times.push(`${String(i).padStart(2, "0")}:${String(j).padStart(2, "0")}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const resumoDia = () => {
    const agendamentosHoje = agendamentos.filter(a => {
      const dataAgendamento = a.data.substring(0, 10);
      const hoje = new Date().toLocaleDateString("en-CA");
      return dataAgendamento === hoje;
    });
    return {
      total: agendamentosHoje.length,
      pendentes: agendamentosHoje.filter(a => a.status === "Pendente").length,
      confirmados: agendamentosHoje.filter(a => a.status === "Confirmado").length,
      concluidos: agendamentosHoje.filter(a => a.status === "Concluído").length,
      cancelados: agendamentosHoje.filter(a => a.status === "Cancelado").length,
    };
  };

  const resumo = resumoDia();

  const calcularDiasRestantes = (dataVencimento) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const venc = new Date(dataVencimento);
    venc.setHours(0, 0, 0, 0);
    return Math.round((venc - hoje) / (1000 * 60 * 60 * 24));
  };

  const getStatusAssinante = (dias) => {
    if (dias < 0) return { label: "❌ Vencido", classe: "status-vencido" };
    if (dias === 0) return { label: "⚠️ Vence hoje", classe: "status-vencendo" };
    if (dias <= 5) return { label: "⚠️ Vencendo", classe: "status-vencendo" };
    return { label: "✅ Ativo", classe: "status-ativo" };
  };

  useEffect(() => {
    buscarAgendamentos();
    buscarAssinantes();
    buscarConfiguracoes();
  }, []);

  const buscarConfiguracoes = async () => {
    try {
      const [servicos, pagamentos, barbeiros, horarios] = await Promise.all([
        axios.get(`${API}/configuracoes/servicos`),
        axios.get(`${API}/configuracoes/pagamentos`),
        axios.get(`${API}/configuracoes/barbeiros`),
        axios.get(`${API}/configuracoes/horarios`),
      ]);
      setServicosRaw(servicos.data);
      setPagamentosRaw(pagamentos.data);
      setBarbeirosRaw(barbeiros.data);
      setServicosOptions(servicos.data.map(s => s.nome));
      setPagamentoOptions(pagamentos.data.map(p => p.nome));
      setBarbeirosOptions(barbeiros.data.map(b => b.nome));
      if (horarios.data.length > 0) setHorariosConfig(horarios.data[0]);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }
  };

  const buscarAgendamentos = async () => {
    try {
      const { data } = await axios.get(`${API}/agendamentos`);
      setAgendamentos(data);
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao carregar agendamentos." });
    }
  };

  const buscarAssinantes = async () => {
    try {
      const { data } = await axios.get(`${API}/assinantes`);
      setAssinantes(data);
    } catch (error) {
      setAssMessage({ type: "error", text: "Erro ao carregar assinantes." });
    }
  };

  const handleCreateAgendamento = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (!nome || !servico || !data || !hora || !pagamento) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios." });
      return;
    }
    try {
      await axios.post(`${API}/agendamentos`, { nome, servico, data, hora: `${hora}:00`, pagamento });
      setMessage({ type: "success", text: "Agendamento criado com sucesso!" });
      setNome(""); setServico(""); setData(""); setHora(""); setPagamento("");
      buscarAgendamentos();
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao criar agendamento." });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/agendamentos/${id}`, { status: newStatus });
      buscarAgendamentos();
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao atualizar status." });
    }
  };

  const handleUpdateBarbeiro = async (id, newBarbeiro) => {
    try {
      const agendamento = agendamentos.find(a => a.id === id);
      await axios.put(`${API}/agendamentos/${id}`, { status: agendamento.status, barbeiro: newBarbeiro });
      buscarAgendamentos();
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao atualizar barbeiro." });
    }
  };

  const handleDeleteConfirmation = (agendamento) => {
    setAgendamentoToDelete(agendamento);
    setShowDeleteModal(true);
  };

  const handleDeleteAgendamento = async () => {
    setShowDeleteModal(false);
    if (!agendamentoToDelete) return;
    try {
      await axios.delete(`${API}/agendamentos/${agendamentoToDelete.id}`);
      setMessage({ type: "success", text: "Agendamento excluído com sucesso!" });
      buscarAgendamentos();
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao excluir agendamento." });
    }
    setAgendamentoToDelete(null);
  };

  const handleCreateAssinante = async (e) => {
    e.preventDefault();
    setAssMessage({ type: "", text: "" });
    if (!assNome || !assPlano || !assInicio || !assVencimento) {
      setAssMessage({ type: "error", text: "Todos os campos são obrigatórios." });
      return;
    }
    try {
      await axios.post(`${API}/assinantes`, {
        nome: assNome, telefone: assTelefone, plano: assPlano,
        data_inicio: assInicio, data_vencimento: assVencimento
      });
      setAssMessage({ type: "success", text: "Assinante cadastrado com sucesso!" });
      setAssNome(""); setAssTelefone(""); setAssPlano("Master"); setAssInicio(""); setAssVencimento("");
      buscarAssinantes();
    } catch (error) {
      setAssMessage({ type: "error", text: "Erro ao cadastrar assinante." });
    }
  };

  const handleDeleteAssinanteConfirmation = (assinante) => {
    setAssinanteToDelete(assinante);
    setShowDeleteAssModal(true);
  };

  const handleDeleteAssinante = async () => {
    setShowDeleteAssModal(false);
    if (!assinanteToDelete) return;
    try {
      await axios.delete(`${API}/assinantes/${assinanteToDelete.id}`);
      setAssMessage({ type: "success", text: "Assinante removido com sucesso!" });
      buscarAssinantes();
    } catch (error) {
      setAssMessage({ type: "error", text: "Erro ao remover assinante." });
    }
    setAssinanteToDelete(null);
  };

  // --- Configurações handlers ---
  const handleAddServico = async () => {
    if (!novoServico.trim()) return;
    try {
      await axios.post(`${API}/configuracoes/servicos`, { nome: novoServico });
      setNovoServico("");
      setConfigMessage({ type: "success", text: "Serviço adicionado!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao adicionar serviço." });
    }
  };

  const handleRemoveServico = async (id) => {
    try {
      await axios.delete(`${API}/configuracoes/servicos/${id}`);
      setConfigMessage({ type: "success", text: "Serviço removido!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao remover serviço." });
    }
  };

  const handleAddPagamento = async () => {
    if (!novoPagamento.trim()) return;
    try {
      await axios.post(`${API}/configuracoes/pagamentos`, { nome: novoPagamento });
      setNovoPagamento("");
      setConfigMessage({ type: "success", text: "Forma de pagamento adicionada!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao adicionar pagamento." });
    }
  };

  const handleRemovePagamento = async (id) => {
    try {
      await axios.delete(`${API}/configuracoes/pagamentos/${id}`);
      setConfigMessage({ type: "success", text: "Forma de pagamento removida!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao remover pagamento." });
    }
  };

  const handleAddBarbeiro = async () => {
    if (!novoBarbeiro.trim()) return;
    try {
      await axios.post(`${API}/configuracoes/barbeiros`, { nome: novoBarbeiro });
      setNovoBarbeiro("");
      setConfigMessage({ type: "success", text: "Barbeiro adicionado!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao adicionar barbeiro." });
    }
  };

  const handleRemoveBarbeiro = async (id) => {
    try {
      await axios.delete(`${API}/configuracoes/barbeiros/${id}`);
      setConfigMessage({ type: "success", text: "Barbeiro removido!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao remover barbeiro." });
    }
  };

  const handleSalvarHorarios = async () => {
    try {
      await axios.put(`${API}/configuracoes/horarios`, horariosConfig);
      setConfigMessage({ type: "success", text: "Horários atualizados!" });
      buscarConfiguracoes();
    } catch (error) {
      setConfigMessage({ type: "error", text: "Erro ao salvar horários." });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeString) => timeString.substring(0, 5);

  return (
    <div className="container">
      <h1>Agendamentos</h1>

      <div className="abas">
        <button className={`aba-btn ${aba === "agendamentos" ? "aba-ativa" : ""}`} onClick={() => setAba("agendamentos")}>
          📅 Agendamentos
        </button>
        <button className={`aba-btn ${aba === "villaclube" ? "aba-ativa" : ""}`} onClick={() => setAba("villaclube")}>
          ⭐ Villa Clube
        </button>
        <button className={`aba-btn ${aba === "configuracoes" ? "aba-ativa" : ""}`} onClick={() => setAba("configuracoes")}>
          ⚙️ Configurações
        </button>
      </div>

      {/* ===== ABA AGENDAMENTOS ===== */}
      {aba === "agendamentos" && (
        <>
          {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="cards-container">
            <div className="card card-total"><span className="card-numero">{resumo.total}</span><span className="card-label">Hoje</span></div>
            <div className="card card-pendente"><span className="card-numero">{resumo.pendentes}</span><span className="card-label">Pendentes</span></div>
            <div className="card card-confirmado"><span className="card-numero">{resumo.confirmados}</span><span className="card-label">Confirmados</span></div>
            <div className="card card-concluido"><span className="card-numero">{resumo.concluidos}</span><span className="card-label">Concluídos</span></div>
            <div className="card card-cancelado"><span className="card-numero">{resumo.cancelados}</span><span className="card-label">Cancelados</span></div>
          </div>

          <h2 className="section-title">Novo Agendamento</h2>
          <form onSubmit={handleCreateAgendamento}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Cliente</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Serviço</label>
                <select value={servico} onChange={(e) => setServico(e.target.value)} required>
                  <option value="" disabled>Selecione</option>
                  {servicosOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Data</label>
                <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Hora</label>
                <select value={hora} onChange={(e) => setHora(e.target.value)} required>
                  <option value="" disabled>Selecione a hora</option>
                  {timeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Pagamento</label>
                <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} required>
                  <option value="" disabled>Selecione</option>
                  {pagamentoOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn">Agendar</button>
          </form>

          <h2 className="section-title">Agendamentos Existentes</h2>
          <div className="filtro-container">
            <label>Data:</label>
            <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
            <label>Barbeiro:</label>
            <select value={filtroBarbeiro} onChange={(e) => setFiltroBarbeiro(e.target.value)}>
              <option value="">Todos</option>
              {barbeirosOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {(filtroData || filtroBarbeiro) && (
              <button className="btn" onClick={() => { setFiltroData(""); setFiltroBarbeiro(""); }}>Limpar filtros</button>
            )}
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Data</th><th>Horário</th><th>Cliente</th><th>Serviço</th>
                  <th>Barbeiro</th><th>Pagamento</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos
                  .filter(a => {
                    const passaData = !filtroData || a.data.substring(0, 10) === filtroData;
                    const passaBarbeiro = !filtroBarbeiro || a.barbeiro === filtroBarbeiro;
                    return passaData && passaBarbeiro;
                  })
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{formatDate(a.data)}</td>
                      <td>{formatTime(a.hora)}</td>
                      <td>{a.nome}</td>
                      <td>{a.servico}</td>
                      <td>
                        <select value={a.barbeiro || ""} onChange={(e) => handleUpdateBarbeiro(a.id, e.target.value)} className="select-barbeiro">
                          <option value="">—</option>
                          {barbeirosOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td>{a.pagamento}</td>
                      <td>
                        <select value={a.status} onChange={(e) => handleUpdateStatus(a.id, e.target.value)} className={`status-${a.status.toLowerCase().replace(/ /g, "-")}`}>
                          {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      <td><button onClick={() => handleDeleteConfirmation(a)} className="btn btn-delete">🗑️</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== ABA VILLA CLUBE ===== */}
      {aba === "villaclube" && (
        <>
          {assMessage.text && <div className={`message ${assMessage.type}`}>{assMessage.text}</div>}
          <h2 className="section-title">Novo Assinante</h2>
          <form onSubmit={handleCreateAssinante}>
            <div className="form-grid">
              <div className="form-group"><label>Nome</label><input type="text" value={assNome} onChange={(e) => setAssNome(e.target.value)} required /></div>
              <div className="form-group"><label>Telefone</label><input type="text" value={assTelefone} onChange={(e) => setAssTelefone(e.target.value)} placeholder="(71) 99999-9999" /></div>
              <div className="form-group">
                <label>Plano</label>
                <select value={assPlano} onChange={(e) => setAssPlano(e.target.value)} required>
                  {planosOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Data de Início</label><input type="date" value={assInicio} onChange={(e) => setAssInicio(e.target.value)} required /></div>
              <div className="form-group"><label>Data de Vencimento</label><input type="date" value={assVencimento} onChange={(e) => setAssVencimento(e.target.value)} required /></div>
            </div>
            <button type="submit" className="btn">Cadastrar Assinante</button>
          </form>

          <h2 className="section-title">Assinantes Villa Clube</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Cliente</th><th>Telefone</th><th>Plano</th><th>Início</th><th>Vencimento</th><th>Dias Restantes</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {assinantes.map((a) => {
                  const dias = calcularDiasRestantes(a.data_vencimento);
                  const statusAss = getStatusAssinante(dias);
                  return (
                    <tr key={a.id}>
                      <td>{a.nome}</td>
                      <td>{a.telefone || "—"}</td>
                      <td>{a.plano}</td>
                      <td>{formatDate(a.data_inicio)}</td>
                      <td>{formatDate(a.data_vencimento)}</td>
                      <td className={dias <= 5 ? "dias-alerta" : ""}>
                        {dias < 0 ? `${Math.abs(dias)} dia${Math.abs(dias) > 1 ? "s" : ""} atrás` : dias === 0 ? "Hoje" : `${dias} dia${dias > 1 ? "s" : ""}`}
                      </td>
                      <td className={statusAss.classe}>{statusAss.label}</td>
                      <td><button onClick={() => handleDeleteAssinanteConfirmation(a)} className="btn btn-delete">🗑️</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== ABA CONFIGURAÇÕES ===== */}
      {aba === "configuracoes" && (
        <>
          {configMessage.text && <div className={`message ${configMessage.type}`}>{configMessage.text}</div>}

          <div className="config-grid">

            {/* Serviços */}
            <div className="config-card">
              <h3 className="config-title">✂️ Serviços</h3>
              <div className="config-add">
                <input type="text" placeholder="Novo serviço..." value={novoServico} onChange={(e) => setNovoServico(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddServico()} />
                <button className="btn" onClick={handleAddServico}>Adicionar</button>
              </div>
              <ul className="config-list">
                {servicosRaw.map((s) => (
                  <li key={s.id}>
                    <span>{s.nome}</span>
                    <button onClick={() => handleRemoveServico(s.id)} className="btn-remove">✕</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagamentos */}
            <div className="config-card">
              <h3 className="config-title">💳 Formas de Pagamento</h3>
              <div className="config-add">
                <input type="text" placeholder="Nova forma..." value={novoPagamento} onChange={(e) => setNovoPagamento(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddPagamento()} />
                <button className="btn" onClick={handleAddPagamento}>Adicionar</button>
              </div>
              <ul className="config-list">
                {pagamentosRaw.map((p) => (
                  <li key={p.id}>
                    <span>{p.nome}</span>
                    <button onClick={() => handleRemovePagamento(p.id)} className="btn-remove">✕</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Barbeiros */}
            <div className="config-card">
              <h3 className="config-title">💈 Barbeiros</h3>
              <div className="config-add">
                <input type="text" placeholder="Nome do barbeiro..." value={novoBarbeiro} onChange={(e) => setNovoBarbeiro(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddBarbeiro()} />
                <button className="btn" onClick={handleAddBarbeiro}>Adicionar</button>
              </div>
              <ul className="config-list">
                {barbeirosRaw.map((b) => (
                  <li key={b.id}>
                    <span>{b.nome}</span>
                    <button onClick={() => handleRemoveBarbeiro(b.id)} className="btn-remove">✕</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Horários */}
            <div className="config-card">
              <h3 className="config-title">🕐 Horários de Atendimento</h3>
              <div className="form-grid" style={{ marginBottom: "1rem" }}>
                <div className="form-group">
                  <label>Início</label>
                  <input type="time" value={horariosConfig.hora_inicio} onChange={(e) => setHorariosConfig({ ...horariosConfig, hora_inicio: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fim</label>
                  <input type="time" value={horariosConfig.hora_fim} onChange={(e) => setHorariosConfig({ ...horariosConfig, hora_fim: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Intervalo (minutos)</label>
                  <select value={horariosConfig.intervalo_minutos} onChange={(e) => setHorariosConfig({ ...horariosConfig, intervalo_minutos: parseInt(e.target.value) })}>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>
              <button className="btn" onClick={handleSalvarHorarios}>Salvar Horários</button>
            </div>

          </div>
        </>
      )}

      {/* Modal deletar agendamento */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o agendamento de {agendamentoToDelete?.nome}?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteAgendamento} className="btn btn-delete">Sim, Excluir</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal deletar assinante */}
      {showDeleteAssModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja remover {assinanteToDelete?.nome} do Villa Clube?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteAssinante} className="btn btn-delete">Sim, Remover</button>
              <button onClick={() => setShowDeleteAssModal(false)} className="btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;