'use client'

import { useState, useEffect } from 'react'
import { 
  type ParlamentarInfo,
  type Comissao
} from '../../../../../services/estrutura-parlamentar.service'

interface ComissaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (comissao: Omit<Comissao, 'id'>) => Promise<void>
  comissaoAtual?: Comissao | null
  vereadores: ParlamentarInfo[]
}

interface ComissaoForm {
  nome: string
  tipo: Comissao['tipo']
  descricao: string
  finalidade: string
  presidenteId: string
  vicePresidenteId: string
  relatorId: string
  membrosIds: string[]
  dataConstituicao: string
  mandatoInicio: string
  mandatoFim: string
  status: Comissao['status']
}

const TIPOS_COMISSAO: { value: Comissao['tipo']; label: string; color: string }[] = [
  { value: 'PERMANENTE', label: 'Permanente', color: 'primary' },
  { value: 'TEMPORARIA', label: 'Temporária', color: 'info' },
  { value: 'ESPECIAL', label: 'Especial', color: 'warning' },
  { value: 'CPI', label: 'CPI', color: 'danger' }
]

const STATUS_COMISSAO: { value: Comissao['status']; label: string; color: string }[] = [
  { value: 'ATIVA', label: 'Ativa', color: 'success' },
  { value: 'INATIVA', label: 'Inativa', color: 'secondary' },
  { value: 'SUSPENSA', label: 'Suspensa', color: 'warning' }
]

export default function ComissaoModal({
  isOpen,
  onClose,
  onSave,
  comissaoAtual,
  vereadores
}: ComissaoModalProps) {
  const [form, setForm] = useState<ComissaoForm>({
    nome: '',
    tipo: 'PERMANENTE',
    descricao: '',
    finalidade: '',
    presidenteId: '',
    vicePresidenteId: '',
    relatorId: '',
    membrosIds: [],
    dataConstituicao: '',
    mandatoInicio: '',
    mandatoFim: '',
    status: 'ATIVA'
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<ComissaoForm>>({})

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (comissaoAtual) {
      setForm({
        nome: comissaoAtual.nome,
        tipo: comissaoAtual.tipo,
        descricao: comissaoAtual.descricao,
        finalidade: comissaoAtual.finalidade || '',
        presidenteId: comissaoAtual.presidente.id,
        vicePresidenteId: comissaoAtual.vicePressidente?.id || '',
        relatorId: comissaoAtual.relator?.id || '',
        membrosIds: comissaoAtual.membros.map(m => m.id),
        dataConstituicao: comissaoAtual.dataConstituicao.split('T')[0],
        mandatoInicio: comissaoAtual.mandatoInicio?.split('T')[0] || '',
        mandatoFim: comissaoAtual.mandatoFim?.split('T')[0] || '',
        status: comissaoAtual.status
      })
    } else {
      // Valores padrão para nova comissão
      const hoje = new Date().toISOString().split('T')[0]
      const fimMandato = new Date()
      fimMandato.setFullYear(fimMandato.getFullYear() + 2)
      
      setForm({
        nome: '',
        tipo: 'PERMANENTE',
        descricao: '',
        finalidade: '',
        presidenteId: '',
        vicePresidenteId: '',
        relatorId: '',
        membrosIds: [],
        dataConstituicao: hoje,
        mandatoInicio: hoje,
        mandatoFim: fimMandato.toISOString().split('T')[0],
        status: 'ATIVA'
      })
    }
  }, [comissaoAtual, isOpen])

  const handleChange = (field: keyof ComissaoForm, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo ao alterar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleMembroToggle = (vereadorId: string) => {
    const novosMembros = form.membrosIds.includes(vereadorId)
      ? form.membrosIds.filter(id => id !== vereadorId)
      : [...form.membrosIds, vereadorId]
    
    handleChange('membrosIds', novosMembros)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ComissaoForm> = {}

    // Campos obrigatórios
    if (!form.nome.trim()) {
      newErrors.nome = 'Nome da comissão é obrigatório'
    }
    if (!form.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    }
    if (!form.presidenteId) {
      newErrors.presidenteId = 'Presidente é obrigatório'
    }
    if (!form.dataConstituicao) {
      newErrors.dataConstituicao = 'Data de constituição é obrigatória'
    }

    // Validar datas para comissões temporárias
    if (form.tipo === 'TEMPORARIA' || form.tipo === 'CPI') {
      if (!form.mandatoInicio) {
        newErrors.mandatoInicio = 'Data de início é obrigatória para comissões temporárias'
      }
      if (!form.mandatoFim) {
        newErrors.mandatoFim = 'Data de fim é obrigatória para comissões temporárias'
      }
      if (form.mandatoInicio && form.mandatoFim) {
        if (new Date(form.mandatoInicio) >= new Date(form.mandatoFim)) {
          newErrors.mandatoFim = 'Data de fim deve ser posterior ao início'
        }
      }
    }

    // Verificar se não há vereadores duplicados nos cargos
    const cargosPreenchidos = [
      form.presidenteId,
      form.vicePresidenteId,
      form.relatorId
    ].filter(id => id !== '')

    const duplicados = cargosPreenchidos.filter((id, index) => 
      cargosPreenchidos.indexOf(id) !== index
    )

    if (duplicados.length > 0) {
      newErrors.presidenteId = 'Não é possível ter o mesmo vereador em múltiplos cargos'
    }

    // Verificar se os cargos estão incluídos nos membros
    const cargosSemMembros = cargosPreenchidos.filter(id => 
      !form.membrosIds.includes(id)
    )

    if (cargosSemMembros.length > 0) {
      newErrors.membrosIds = ['Presidente, Vice-Presidente e Relator devem estar incluídos nos membros']
    }

    // Mínimo de membros
    if (form.membrosIds.length < 3) {
      newErrors.membrosIds = ['Comissão deve ter pelo menos 3 membros']
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Buscar dados dos vereadores selecionados
      const findVereador = (id: string) => vereadores.find(v => v.id === id)

      const presidente = findVereador(form.presidenteId)
      if (!presidente) {
        throw new Error('Presidente não encontrado')
      }

      const membros = form.membrosIds.map(id => findVereador(id)).filter(Boolean) as ParlamentarInfo[]

      const comissaoDados: Omit<Comissao, 'id'> = {
        nome: form.nome.trim(),
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        finalidade: form.finalidade.trim(),
        presidente,
        vicePressidente: form.vicePresidenteId ? findVereador(form.vicePresidenteId) : undefined,
        relator: form.relatorId ? findVereador(form.relatorId) : undefined,
        membros,
        dataConstituicao: form.dataConstituicao,
        status: form.status,
        mandatoInicio: form.mandatoInicio || undefined,
        mandatoFim: form.mandatoFim || undefined
      }

      await onSave(comissaoDados)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar comissão:', error)
      alert('Erro ao salvar comissão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const getTipoConfig = (tipo: Comissao['tipo']) => {
    return TIPOS_COMISSAO.find(t => t.value === tipo) || TIPOS_COMISSAO[0]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusConfig = (status: Comissao['status']) => {
    return STATUS_COMISSAO.find(s => s.value === status) || STATUS_COMISSAO[0]
  }

  if (!isOpen) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable" style={{ maxHeight: '95vh', marginTop: '2.5vh', marginBottom: '2.5vh' }}>
        <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                <i className={`ki-duotone ki-setting-3 fs-1 text-${getTipoConfig(form.tipo).color} me-3`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
                {comissaoAtual ? 'Editar Comissão' : 'Criar Nova Comissão'}
              </h2>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClose}
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body" style={{ flex: '1', overflowY: 'auto', padding: '20px' }}>
              <div className="row g-6">
                {/* Informações Básicas */}
                <div className="col-12">
                  <div className="card border-light">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <i className="ki-duotone ki-information fs-2 text-primary me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        Informações Básicas
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-4">
                        <div className="col-md-8">
                          <div className="fv-row">
                            <label className="required form-label">Nome da Comissão</label>
                            <input
                              type="text"
                              className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                              value={form.nome}
                              onChange={(e) => handleChange('nome', e.target.value)}
                              placeholder="Ex: Comissão de Educação e Cultura"
                              disabled={loading}
                            />
                            {errors.nome && (
                              <div className="invalid-feedback">{errors.nome}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="fv-row">
                            <label className="required form-label">Tipo</label>
                            <select
                              className="form-select"
                              value={form.tipo}
                              onChange={(e) => handleChange('tipo', e.target.value as Comissao['tipo'])}
                              disabled={loading}
                            >
                              {TIPOS_COMISSAO.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>
                                  {tipo.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="fv-row">
                            <label className="required form-label">Descrição</label>
                            <textarea
                              className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                              rows={3}
                              value={form.descricao}
                              onChange={(e) => handleChange('descricao', e.target.value)}
                              placeholder="Descreva as responsabilidades e objetivos da comissão"
                              disabled={loading}
                            />
                            {errors.descricao && (
                              <div className="invalid-feedback">{errors.descricao}</div>
                            )}
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="fv-row">
                            <label className="form-label">Finalidade</label>
                            <textarea
                              className="form-control"
                              rows={2}
                              value={form.finalidade}
                              onChange={(e) => handleChange('finalidade', e.target.value)}
                              placeholder="Finalidade específica da comissão (opcional)"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composição da Comissão */}
                <div className="col-12">
                  <div className="card border-light">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <i className="ki-duotone ki-people fs-2 text-success me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                        Composição da Comissão
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-4">
                        {/* Presidente */}
                        <div className="col-md-4">
                          <div className="fv-row">
                            <label className="required form-label">
                              <i className="ki-duotone ki-crown fs-3 text-warning me-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              Presidente
                            </label>
                            <select
                              className={`form-select ${errors.presidenteId ? 'is-invalid' : ''}`}
                              value={form.presidenteId}
                              onChange={(e) => handleChange('presidenteId', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Selecione o Presidente</option>
                              {vereadores.map(vereador => (
                                <option key={vereador.id} value={vereador.id}>
                                  {vereador.nome} ({vereador.partido.sigla})
                                </option>
                              ))}
                            </select>
                            {errors.presidenteId && (
                              <div className="invalid-feedback">{errors.presidenteId}</div>
                            )}
                          </div>
                        </div>

                        {/* Vice-Presidente */}
                        <div className="col-md-4">
                          <div className="fv-row">
                            <label className="form-label">
                              <i className="ki-duotone ki-user-tick fs-3 text-primary me-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                              </i>
                              Vice-Presidente
                            </label>
                            <select
                              className="form-select"
                              value={form.vicePresidenteId}
                              onChange={(e) => handleChange('vicePresidenteId', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Selecione o Vice-Presidente</option>
                              {vereadores.map(vereador => (
                                <option key={vereador.id} value={vereador.id}>
                                  {vereador.nome} ({vereador.partido.sigla})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Relator */}
                        <div className="col-md-4">
                          <div className="fv-row">
                            <label className="form-label">
                              <i className="ki-duotone ki-document fs-3 text-info me-2">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              Relator
                            </label>
                            <select
                              className="form-select"
                              value={form.relatorId}
                              onChange={(e) => handleChange('relatorId', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">Selecione o Relator</option>
                              {vereadores.map(vereador => (
                                <option key={vereador.id} value={vereador.id}>
                                  {vereador.nome} ({vereador.partido.sigla})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Membros */}
                        <div className="col-12">
                          <div className="fv-row">
                            <label className="required form-label">
                              Membros da Comissão
                              <span className="text-muted fs-7 ms-2">
                                (Mínimo 3 membros - Clique para selecionar/deselecionar)
                              </span>
                            </label>
                            
                            {errors.membrosIds && (
                              <div className="alert alert-danger mb-3">
                                {errors.membrosIds}
                              </div>
                            )}

                            <div className="row g-3">
                              {vereadores.map(vereador => {
                                const isSelected = form.membrosIds.includes(vereador.id)
                                const isPresidente = form.presidenteId === vereador.id
                                const isVicePresidente = form.vicePresidenteId === vereador.id
                                const isRelator = form.relatorId === vereador.id
                                
                                let badge = ''
                                if (isPresidente) badge = 'Presidente'
                                else if (isVicePresidente) badge = 'Vice-Presidente'
                                else if (isRelator) badge = 'Relator'

                                return (
                                  <div key={vereador.id} className="col-md-4">
                                    <div 
                                      className={`card cursor-pointer ${isSelected ? 'border-primary bg-light-primary' : 'border-light'}`}
                                      onClick={() => handleMembroToggle(vereador.id)}
                                      style={{ transition: 'all 0.2s' }}
                                    >
                                      <div className="card-body p-3">
                                        <div className="d-flex align-items-center">
                                          <div className="form-check me-3">
                                            <input
                                              className="form-check-input"
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() => handleMembroToggle(vereador.id)}
                                            />
                                          </div>
                                          <div className="flex-grow-1">
                                            <div className="fw-bold text-gray-900">{vereador.nome}</div>
                                            <div className="text-muted fs-7">{vereador.partido.sigla}</div>
                                            {badge && (
                                              <span className="badge badge-light-warning fs-8 mt-1">
                                                {badge}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datas e Status */}
                <div className="col-12">
                  <div className="card border-light">
                    <div className="card-header">
                      <h5 className="card-title mb-0">
                        <i className="ki-duotone ki-calendar fs-2 text-info me-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        Datas e Status
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-4">
                        <div className="col-md-3">
                          <div className="fv-row">
                            <label className="required form-label">Data de Constituição</label>
                            <input
                              type="date"
                              className={`form-control ${errors.dataConstituicao ? 'is-invalid' : ''}`}
                              value={form.dataConstituicao}
                              onChange={(e) => handleChange('dataConstituicao', e.target.value)}
                              disabled={loading}
                            />
                            {errors.dataConstituicao && (
                              <div className="invalid-feedback">{errors.dataConstituicao}</div>
                            )}
                          </div>
                        </div>

                        {(form.tipo === 'TEMPORARIA' || form.tipo === 'CPI') && (
                          <>
                            <div className="col-md-3">
                              <div className="fv-row">
                                <label className="required form-label">Início do Mandato</label>
                                <input
                                  type="date"
                                  className={`form-control ${errors.mandatoInicio ? 'is-invalid' : ''}`}
                                  value={form.mandatoInicio}
                                  onChange={(e) => handleChange('mandatoInicio', e.target.value)}
                                  disabled={loading}
                                />
                                {errors.mandatoInicio && (
                                  <div className="invalid-feedback">{errors.mandatoInicio}</div>
                                )}
                              </div>
                            </div>

                            <div className="col-md-3">
                              <div className="fv-row">
                                <label className="required form-label">Fim do Mandato</label>
                                <input
                                  type="date"
                                  className={`form-control ${errors.mandatoFim ? 'is-invalid' : ''}`}
                                  value={form.mandatoFim}
                                  onChange={(e) => handleChange('mandatoFim', e.target.value)}
                                  disabled={loading}
                                />
                                {errors.mandatoFim && (
                                  <div className="invalid-feedback">{errors.mandatoFim}</div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="col-md-3">
                          <div className="fv-row">
                            <label className="form-label">Status</label>
                            <select
                              className="form-select"
                              value={form.status}
                              onChange={(e) => handleChange('status', e.target.value as Comissao['status'])}
                              disabled={loading}
                            >
                              {STATUS_COMISSAO.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ flexShrink: 0, borderTop: '1px solid #e4e6ea' }}>
              <button 
                type="button" 
                className="btn btn-light" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="ki-duotone ki-check fs-2"></i>
                    {comissaoAtual ? 'Atualizar Comissão' : 'Criar Comissão'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 