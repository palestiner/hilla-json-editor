import './JsonBrowser.module.css'
import { VerticalLayout } from '@hilla/react-components/VerticalLayout'
import { HorizontalLayout } from '@hilla/react-components/HorizontalLayout'
import { useEffect, useState } from 'react'
import Json from 'Frontend/generated/com/palestiner/jsoneditor/model/Json.js'
import JsonModel from 'Frontend/generated/com/palestiner/jsoneditor/model/JsonModel.js'
import { deleteJsons, findAll, save, update } from 'Frontend/generated/JsonEndpoint.js'
import { Button } from '@hilla/react-components/Button'
import { Dialog } from '@hilla/react-components/Dialog'
import { Grid } from '@hilla/react-components/Grid'
import { GridColumn } from '@hilla/react-components/GridColumn'
import { TextField } from '@hilla/react-components/TextField'
import { GridSelectionColumn } from '@hilla/react-components/GridSelectionColumn'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { TextArea } from '@hilla/react-components/TextArea'

export default function JsonBrowser() {
  const [jsons, setJsons] = useState<Json[]>([])
  const [jsonEditorShow, setJsonEditorShow] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [updateBtnClicked, setUpdateBtnClicked] = useState(false)
  const [createBtnClicked, setCreateBtnClicked] = useState(false)
  const [selectedJsons, setSelectedJsons] = useState<Json[]>([])
  const [jsonToEdit, setJsonToEdit] = useState(JsonModel.createEmptyValue())

  useEffect(() => {
    findAll().then(setJsons)
  }, [])

  function resetStateOnCloseEditorDialog() {
    setJsonEditorShow(false)
    setUpdateBtnClicked(false)
    setCreateBtnClicked(false)
    setSelectedJsons([])
    const timeoutNumber = setTimeout(() => {
      setName('')
      setContent('')
    }, 150)
  }

  function saveJson() {
    save(name, content).then(json => {
      setJsonToEdit(json)
      setJsons([...jsons, json].sort((a, b) => {
        if (a.name && b.name) {
          return a.name < b.name ? -1 : 1
        }
        return 1
      }))
    })
  }

  function updateJson() {
    const jsonToUpdate = JsonModel.createEmptyValue()
    jsonToUpdate.id = jsonToEdit.id
    jsonToUpdate.name = name
    jsonToUpdate.content = content
    update(jsonToUpdate).then(value => {
      setJsonToEdit(value)
      setJsons(jsons.map(json => {
        if (json.id === value.id) {
          return value
        } else return json
      }))
    })
  }

  function deleteSelectedJsons(jsonsToDelete: Json[]) {
    deleteJsons(jsonsToDelete).then(() => {
      setJsons(jsons.filter(value => !jsonsToDelete.includes(value)))
    })
  }

  return (
      <VerticalLayout>
        <HorizontalLayout
            id="crud-buttons"
            theme="spacing padding">
          <Button
              id="create-btn"
              theme="primary"
              onClick={() => {
                setJsonEditorShow(true)
                setCreateBtnClicked(true)
              }}>
            Create
          </Button>
          <Button
              id="edit-btn"
              theme="secondary"
              onClick={() => {
                setJsonToEdit(selectedJsons[0])
                setName(selectedJsons[0].name || '')
                setContent(selectedJsons[0].content || '')
                setJsonEditorShow(true)
                setUpdateBtnClicked(true)
              }}
              disabled={!(selectedJsons.length === 1)}>Edit</Button>
          <Button
              id="delete-btn"
              theme="secondary error"
              onClick={() => {
                deleteSelectedJsons(selectedJsons)
              }}
              disabled={!(selectedJsons.length > 0)}>Delete</Button>
        </HorizontalLayout>
        <Grid
            style={{ width: '100%', borderLeft: 'none' }}
            items={jsons}
            selectedItems={selectedJsons}
            onSelectedItemsChanged={({ detail: { value } }) => setSelectedJsons(value)}
            onActiveItemChanged={({ detail: { value } }) => {
              setSelectedJsons(value ? [value] : [])
            }}
            onDataProviderChanged={e => setSelectedJsons([])}
            theme="column-borders row-stripes">
          <GridSelectionColumn width="60px" />
          <GridColumn path="name" />
          <GridColumn path="content" />
        </Grid>
        <Dialog
            opened={jsonEditorShow}
            onOpenedChanged={({ detail: { value } }) => {
              setJsonEditorShow(value)
              if (!value) {
                resetStateOnCloseEditorDialog()
              }
            }}
            header={<h3 className="m-0">Json Editor</h3>}
            footer={
              <div className="flex gap-m">
                <Button onClick={() => {
                  resetStateOnCloseEditorDialog()
                }}>
                  Cancel
                </Button>
                <Button
                    theme="primary"
                    onClick={() => {
                      if (createBtnClicked) saveJson()
                      if (updateBtnClicked) updateJson()
                      resetStateOnCloseEditorDialog()
                    }}>
                  Save
                </Button>
              </div>
            }>
          <VerticalLayout
              style={{ width: '700px' }}
              theme="spacing padding">
            <TextField
                id="name-field"
                style={{ width: '250px' }}
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)} />
            <TextArea
                id="content-field"
                style={{ width: '100%' }}
                label="Content"
                value={content}
                onChange={e => setContent(e.target.value)} />

            {/* @ts-ignore*/}
            <AceEditor
                mode="json"
                width="100%"
                theme="textmate"
                fontSize={20}
                name="json-editor"
                tabSize={2}
                value={content}
                onChange={(value: string) => setContent(value)}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                }} />
          </VerticalLayout>
        </Dialog>
      </VerticalLayout>
  )
}
