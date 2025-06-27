'use client'

import React, { useState, useCallback } from 'react'
import AdministradorLayout from '../../../layout'
import { PageTitle } from '../../../../../_metronic/layout/core'
import WordLikeEditor from '../../../../../components/editor/WordLikeEditor'

export default function ExemploWordEditorPage() {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Exemplo de conteúdo inicial com formatação ABNT
  const exemploConteudo = `
    <h1 class="abnt-title">PROJETO DE LEI Nº 001/2025</h1>
    
    <p class="abnt-ementa"><strong>EMENTA:</strong> Dispõe sobre a criação do programa municipal de educação ambiental e dá outras providências.</p>
    
    <p class="abnt-article"><strong>Art. 1º</strong> Fica instituído o Programa Municipal de Educação Ambiental, com o objetivo de promover a conscientização e a educação ambiental no âmbito do município.</p>
    
    <p class="abnt-paragraph"><strong>§ 1º</strong> O programa de que trata o caput deste artigo será desenvolvido em parceria com as escolas municipais, organizações não governamentais e a sociedade civil organizada.</p>
    
    <p class="abnt-paragraph"><strong>§ 2º</strong> As atividades do programa incluirão workshops, palestras, campanhas de conscientização e projetos práticos de sustentabilidade.</p>
    
    <p class="abnt-article"><strong>Art. 2º</strong> São objetivos específicos do Programa Municipal de Educação Ambiental:</p>
    
    <p class="abnt-inciso">I - promover a conscientização sobre a importância da preservação ambiental;</p>
    
    <p class="abnt-inciso">II - desenvolver práticas sustentáveis na comunidade;</p>
    
    <p class="abnt-inciso">III - formar multiplicadores em educação ambiental;</p>
    
    <p class="abnt-inciso">IV - estabelecer parcerias com instituições de ensino e pesquisa.</p>
    
    <p class="abnt-article"><strong>Art. 3º</strong> O programa será coordenado pela Secretaria Municipal de Meio Ambiente, que poderá:</p>
    
    <p class="abnt-alinea">a) elaborar cronograma anual de atividades;</p>
    
    <p class="abnt-alinea">b) definir metas e indicadores de desempenho;</p>
    
    <p class="abnt-alinea">c) estabelecer parcerias com outras secretarias municipais;</p>
    
    <p class="abnt-alinea">d) buscar recursos financeiros para implementação das ações.</p>
    
    <blockquote class="abnt-citation">
      A educação ambiental é fundamental para o desenvolvimento sustentável, pois promove a mudança de comportamento e a formação de cidadãos conscientes de sua responsabilidade com o meio ambiente (JACOBI, 2003, p. 195).
    </blockquote>
    
    <h2 class="abnt-section">JUSTIFICATIVA</h2>
    
    <p class="abnt-justify">A criação do Programa Municipal de Educação Ambiental se justifica pela necessidade crescente de conscientização da população sobre questões ambientais. O município enfrenta desafios relacionados ao descarte inadequado de resíduos, poluição de recursos hídricos e desmatamento de áreas verdes.</p>
    
    <p class="abnt-justify">A educação ambiental é uma ferramenta fundamental para a construção de uma sociedade mais sustentável. Através de ações educativas, é possível formar cidadãos conscientes de sua responsabilidade ambiental, capazes de tomar decisões que contribuam para a preservação do meio ambiente.</p>
    
    <p class="abnt-justify">O programa proposto prevê ações diversificadas, desde a educação formal nas escolas até campanhas de conscientização para a população em geral. Esta abordagem integrada permite alcançar diferentes públicos e multiplicar o impacto das ações educativas.</p>
    
    <div class="abnt-signature">
      <p class="signature-location">Município, 15 de janeiro de 2025</p>
      <br><br>
      <p class="signature-line">_________________________________</p>
      <p class="signature-name">Vereador João Silva</p>
      <p class="signature-title">Presidente da Comissão de Meio Ambiente</p>
    </div>
  `

  const handleContentChange = useCallback((textContent: string, htmlContent: string) => {
    setContent(htmlContent)
  }, [])

  const handleSave = useCallback(async (textContent: string, htmlContent: string) => {
    setIsSaving(true)
    try {
      // Simular salvamento (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedContent(htmlContent)
      console.log('Documento salvo:', { textContent, htmlContent })
      alert('Documento salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar documento. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleLoadExample = () => {
    setContent(exemploConteudo)
  }

  const handleClearContent = () => {
    if (confirm('Deseja realmente limpar todo o conteúdo?')) {
      setContent('')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <AdministradorLayout>
      <PageTitle breadcrumbs={[
        { title: 'Configurações', path: '/admin/configuracoes', isSeparator: false, isActive: false },
        { title: 'Documentos e Templates', path: '/admin/configuracoes/documentos-templates', isSeparator: false, isActive: false },
        { title: 'Editor Word-like', path: '', isSeparator: false, isActive: true },
      ]}>
        Editor no Estilo Microsoft Word
      </PageTitle>

      <div className="d-flex flex-column flex-lg-row">
        {/* Sidebar com controles */}
        <div className="flex-column flex-lg-row-auto w-100 w-lg-300px mb-10 mb-lg-0 me-lg-10">
          {/* Card de Informações */}
          <div className="card mb-5">
            <div className="card-header">
              <h3 className="card-title">Editor Avançado</h3>
            </div>
            <div className="card-body">
              <div className="mb-5">
                <p className="text-muted mb-3">
                  Este editor reproduz a experiência do Microsoft Word com:
                </p>
                <ul className="text-muted">
                  <li>📏 Réguas horizontais e verticais</li>
                  <li>📄 Páginas A4 com sombra</li>
                  <li>📝 Formatação ABNT completa</li>
                  <li>🔧 Elementos legislativos</li>
                  <li>🔍 Zoom de 50% a 200%</li>
                  <li>📃 Paginação automática</li>
                </ul>
              </div>
              
              <div className="separator my-5"></div>
              
              <h4 className="mb-3">Ações Rápidas</h4>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-light-primary btn-sm"
                  onClick={handleLoadExample}
                >
                  <i className="ki-duotone ki-document fs-4 me-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Carregar Exemplo
                </button>
                
                <button 
                  className="btn btn-light-warning btn-sm"
                  onClick={handleClearContent}
                >
                  <i className="ki-duotone ki-trash fs-4 me-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                  Limpar Conteúdo
                </button>
                
                <button 
                  className="btn btn-light-info btn-sm"
                  onClick={handlePrint}
                >
                  <i className="ki-duotone ki-printer fs-4 me-2">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                  </i>
                  Imprimir
                </button>
                
                <button 
                  className={`btn btn-light-${showPreview ? 'danger' : 'success'} btn-sm`}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <i className={`ki-duotone ${showPreview ? 'ki-eye-slash' : 'ki-eye'} fs-4 me-2`}>
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
                </button>
              </div>
            </div>
          </div>

          {/* Card de Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Status</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <span className="text-muted">Salvamento:</span>
                <span className={`badge badge-light-${isSaving ? 'warning' : 'success'} ms-2`}>
                  {isSaving ? 'Salvando...' : 'Pronto'}
                </span>
              </div>
              
              <div className="mb-3">
                <span className="text-muted">Caracteres:</span>
                <span className="fw-bold ms-2">{content.length}</span>
              </div>
              
              <div className="mb-3">
                <span className="text-muted">Palavras (aprox.):</span>
                <span className="fw-bold ms-2">
                  {content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length}
                </span>
              </div>
              
              <div className="mb-3">
                <span className="text-muted">Última salvamento:</span>
                <div className="text-success fs-7">
                  {savedContent ? 'Salvo com sucesso!' : 'Não salvo'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área principal do editor */}
        <div className="flex-lg-row-fluid">
          <div className="card">
            <div className="card-header border-0 pt-6">
              <div className="card-title">
                <h2 className="fw-bold">Editor de Documentos ABNT</h2>
              </div>
              <div className="card-toolbar">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge badge-light-primary">
                    <i className="ki-duotone ki-check-circle fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Formato A4
                  </span>
                  <span className="badge badge-light-success">
                    <i className="ki-duotone ki-ruler fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Réguas Ativas
                  </span>
                  <span className="badge badge-light-info">
                    <i className="ki-duotone ki-abstract-26 fs-4 me-1">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    ABNT
                  </span>
                </div>
              </div>
            </div>
            
            <div className="card-body p-0">
              {!showPreview ? (
                <div style={{ minHeight: '800px' }}>
                  <WordLikeEditor
                    initialContent={content}
                    placeholder="Digite seu documento seguindo as normas ABNT. Use os elementos legislativos na toolbar para formatação automática..."
                    onChange={handleContentChange}
                    onSave={handleSave}
                  />
                </div>
              ) : (
                <div className="p-10">
                  <div className="d-flex align-items-center mb-5">
                    <h3 className="fw-bold mb-0 me-3">Preview do Conteúdo</h3>
                    <span className="badge badge-light-primary">HTML Gerado</span>
                  </div>
                  
                  <div className="bg-light p-5 rounded">
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                      {content || 'Nenhum conteúdo para visualizar...'}
                    </pre>
                  </div>
                  
                  {content && (
                    <>
                      <div className="separator my-8"></div>
                      <h4 className="fw-bold mb-5">Renderização Final</h4>
                      <div 
                        className="border p-8 bg-white rounded"
                        dangerouslySetInnerHTML={{ __html: content }}
                        style={{
                          fontFamily: 'Times New Roman, Times, serif',
                          fontSize: '12pt',
                          lineHeight: '1.5',
                          textAlign: 'justify'
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdministradorLayout>
  )
} 