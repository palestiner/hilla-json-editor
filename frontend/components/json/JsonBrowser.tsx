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
import { Editor } from '@monaco-editor/react'
import '@vaadin/icons'
import { Icon } from '@hilla/react-components/Icon'
import { Checkbox } from '@hilla/react-components/Checkbox'
import { CheckboxGroup } from '@hilla/react-components/CheckboxGroup'

export default function JsonBrowser() {
  const [jsons, setJsons] = useState<Json[]>([])
  const [jsonEditorShow, setJsonEditorShow] = useState(false)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [updateBtnClicked, setUpdateBtnClicked] = useState(false)
  const [createBtnClicked, setCreateBtnClicked] = useState(false)
  const [selectedJsons, setSelectedJsons] = useState<Json[]>([])
  const [jsonToEdit, setJsonToEdit] = useState(JsonModel.createEmptyValue())
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(false)
  const [filteredJsons, setFilteredJsons] = useState<Json[]>([])

  useEffect(() => {
    findAll().then(fetchedJsons => {
      setJsons(fetchedJsons)
      setFilteredJsons(fetchedJsons)
    })
  }, [])

  useEffect(() => {
    setFilteredJsons(jsons)
  }, [jsons]);

  function resetStateOnCloseEditorDialog() {
    setJsonEditorShow(false)
    setUpdateBtnClicked(false)
    setCreateBtnClicked(false)
    setSelectedJsons([])
  }

  function saveJson() {
    save(name, content, disabled).then(json => {
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
    jsonToUpdate.disabled = disabled
    console.log(jsonToUpdate)
    update(jsonToUpdate).then(value => {
      console.log(value)
      setJsonToEdit(value)
      setJsons(jsons.map(json => {
        if (json.id === value.id) {
          return value
        }
        return json
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
                setName('')
                setContent('')
                setDisabled(false)
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
                setName(selectedJsons[0].name)
                setContent(selectedJsons[0].content)
                setDisabled(selectedJsons[0].disabled)
                setJsonEditorShow(true)
                setUpdateBtnClicked(true)
              }}
              disabled={!(selectedJsons.length === 1)}>
            Edit
          </Button>
          <Button
              id="delete-btn"
              theme="secondary error"
              onClick={() => {
                deleteSelectedJsons(selectedJsons)
              }}
              disabled={!(selectedJsons.length > 0)}>
            Delete
          </Button>
          <TextField
              placeholder="Search"
              style={{ width: '50%' }}
              onValueChanged={(e) => {
                const searchTerm = (e.detail.value || '').trim().toLowerCase();
                setFilteredJsons(
                    jsons.filter(
                        ({ name }) =>
                            !searchTerm || name.toLowerCase().includes(searchTerm)
                    )
                )
              }}>
            <Icon slot="prefix"
                  icon="vaadin:search"></Icon>
          </TextField>
        </HorizontalLayout>
        <Grid
            style={{ width: '100%', borderLeft: 'none' }}
            items={filteredJsons}
            selectedItems={selectedJsons}
            onSelectedItemsChanged={({ detail: { value } }) => setSelectedJsons(value)}
            onActiveItemChanged={({ detail: { value } }) => {
              setSelectedJsons(value ? [value] : [])
            }}
            onDataProviderChanged={e => setSelectedJsons([])}
            theme="column-borders row-stripes">
          <GridSelectionColumn width="60px" />
          <GridColumn path="name" />
          <GridColumn path="disabled" />
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
                    disabled={saveBtnDisabled}
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
            <CheckboxGroup
                onValueChanged={e => {
                  // @ts-ignore
                  const val = e.currentTarget.value[0]
                  setDisabled(!!val)
                }}>
              <Checkbox
                  id="disabled-field"
                  label="Disabled"
                  checked={disabled} />
            </CheckboxGroup>
            {"Content"}
            <Editor
                className="json-editor"
                height="50vh"
                language="json"
                theme="light"
                value={content}
                onChange={(value) => setContent(value || '')}
                onValidate={markers => {
                  setSaveBtnDisabled(markers.length !== 0)
                }}
                options={{
                  tabSize: 2,
                  lineNumbers: "on",
                  fontSize: 16,
                  formatOnType: true,
                  autoClosingBrackets: "always",
                  autoClosingComments: "always",
                  autoClosingDelete: "always",
                  autoClosingOvertype: "always",
                  autoClosingQuotes: "always",
                  autoSurround: "languageDefined",
                  minimap: { enabled: false },
                }}
            />
          </VerticalLayout>
        </Dialog>
      </VerticalLayout>
  )
}
