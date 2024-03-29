import React from 'react'
import { makeStyles, List, Grid, Paper, Button } from '@material-ui/core'
import SectionProperties from './SectionProperties'
import ComponentProperties from './ComponentProperties'
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle'
import AttachFileIcon from '@material-ui/icons/AttachFile'
import TextFieldsIcon from '@material-ui/icons/TextFields'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import TextFormatIcon from '@material-ui/icons/TextFormat'
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked'
import { connect } from 'react-redux'
import CheckboxProperties from './item-properties/CheckboxProperties'
import DropdownProperties from './item-properties/DropdownProperties'
import FileProperties from './item-properties/FileProperties'
import RadioProperties from './item-properties/RadioProperties'
import TextboxProperties from './item-properties/TextboxProperties'
import TextlabelProperties from './item-properties/TextlabelProperties'
import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-material-ui'
import { editChecklistSubtask } from '../formTemplateSlice'
import { setPropertyWindow } from '../propertiesDataSlice'

const useStyles = makeStyles((theme) => ({
  propertiesPaper: {
    padding: theme.spacing(2),
    position: 'fixed',
    width: 200,
    height: '100%',
    backgroundColor: theme.palette.action.selected,
  },
  innerDiv: {
    padding: theme.spacing(2),
    marginTop: '3%',
    position: 'fixed',
    width: 200,
    maxHeight: '75%',
    overflow: 'auto'
  },
  subtaskPaper: {
    padding: theme.spacing(1),
    width: '90%',
    height: '100%',
    maxHeight: 100,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.secondary.main,
    marginBottom: 10,
  },
  checklist: {
    marginTop: '-1%',
    position: 'fixed',
    width: 200,
    maxHeight: '75%',
    overflow: 'auto'
  }
}))

/**
  Returns the core conditional Properties Container which renders the correct property window based on the type,
  with two small property windows (AddItemProperties and ChecklistProperties) INSIDE this function as nested components,
  since they do not have any dependencies.

  @param {object} propertiesData from the corresponding redux slice, all property window data is used here
  @param {object} formTemplate from the corresponding redux slice, to retrieve all form template data required to pass them on
  and populate the sub-property windows (Section, Item, Component, Checklist)
*/

function Properties({propertiesData, formTemplate, dispatch}) {
  const classes = useStyles()
  const { propertyType, propertyAddMode, propertyId, parentId } = propertiesData
  const { sectionTitles, checklistItems, componentTitles, items, itemsOrder } = formTemplate
  const itemProperties = { propertyAddMode, propertyId, parentId, itemData: propertyAddMode ?  null : items[propertyId] }

  let title = ""
  let renderProperties = null

  switch (propertyType) { //selecting property title and component to render inside based on property type
    case "add-item":
      title = "Item"
      renderProperties = <AddItemProperties/>
      break
    case "component":
      title = "Component"
      renderProperties = <ComponentProperties itemsOrder={itemsOrder} items={items} propertyAddMode={propertyAddMode} 
        propertyId={propertyId} parentId={parentId} componentTitle={componentTitles[propertyId]}/>
      break
    case "section":
      title = "Section"
      renderProperties = <SectionProperties propertyAddMode={propertyAddMode} propertyId={propertyId} sectionTitle={propertyAddMode ? '' : sectionTitles[propertyId]}/>
      break    
    case "checklist":
      title = "Checklist"
      renderProperties = <FormChecklistProperties {...itemProperties}/>
      break
    case "item-textbox":
      title = "Text Box"
      renderProperties = <TextboxProperties {...itemProperties}/>
      break
    case "item-textlabel":
      title = "Text Label"
      renderProperties = <TextlabelProperties {...itemProperties}/>
      break
    case "item-dropdown":
      title = "Dropdown"
      renderProperties = <DropdownProperties {...itemProperties}/>
      break
    case "item-radio":
      title = "Radio Button"
      renderProperties = <RadioProperties {...itemProperties}/>
      break
    case "item-checkbox":
      title = "Checkbox"
      renderProperties = <CheckboxProperties {...itemProperties}/>
      break 
    case "item-file":
      title = "File Upload"
      renderProperties = <FileProperties {...itemProperties}/>
      break
    default:
      renderProperties = null
      break
  }

  if (propertyType === "") return ( // shown on default entry into the form maker (default properties window)
    <Paper square variant="outlined" className={classes.propertiesPaper}>
      <h3 style={{marginTop: 10}}>Welcome to the CMS Form Maker!</h3>
      <p>
        You can add as many sections as required, logical components in them and items of the defined types within those.
        Contact us if you have any queries regarding usage. Note: Form item fields have been kept non-interactive for ease of focus. 
      </p>
    </Paper>  
  )

  // AddItemProperties displays buttons for every item type, opening the complete item properties for that item type on click (by setPropertyWindow)
  function AddItemProperties(){  
    const commonProps = {color: "primary", variant: "contained", style: {marginBottom: 15}}
    return (
      <Grid container direction='column' >
        <Button onClick={()=> dispatch(setPropertyWindow({propertyId, parentId, propertyType: 'item-textbox', propertyAddMode: true})) } {...commonProps}
          startIcon={<TextFieldsIcon/>}>Text Box</Button>

        <Button onClick={()=> dispatch(setPropertyWindow({propertyId, parentId, propertyType: 'item-textlabel', propertyAddMode: true})) } {...commonProps}
          startIcon={<TextFormatIcon/>}>Text Label</Button>

        <Button onClick={()=> dispatch(setPropertyWindow({propertyId, parentId, propertyType: 'item-dropdown', propertyAddMode: true})) } {...commonProps}
          startIcon={<ArrowDropDownCircleIcon/>}>Dropdown</Button>

        <Button onClick={()=> dispatch(setPropertyWindow({propertyId, parentId, propertyType: 'item-radio', propertyAddMode: true})) } {...commonProps}
          startIcon={<RadioButtonCheckedIcon/>}>Radio Button</Button>

        <Button onClick={()=> dispatch(setPropertyWindow({propertyId, parentId, propertyType: 'item-checkbox', propertyAddMode: true})) } {...commonProps}
          startIcon={<CheckBoxIcon/>}>Checkbox</Button>

        <Button onClick={()=> dispatch(setPropertyWindow({propertyId, parentId, propertyType: 'item-file', propertyAddMode: true})) } {...commonProps}
          startIcon={<AttachFileIcon/>}>File Upload</Button>
      </Grid>
    )
  }

  // Properties window for the Form Checklist editor, renders editable text fields for subtasks corresponding to every section
  function FormChecklistProperties(){
    return (
      <List className={classes.checklist}>
        {
          checklistItems.map(checklistItem => {
            const sectionId = checklistItem.sectionId
            const sectionTitle = sectionTitles[sectionId]
            const subtask = checklistItem.description
            return (
              <Paper key={sectionId} className={classes.subtaskPaper}>
                <h5 style={{marginBottom: 0, marginTop: 4}} >{sectionTitle}</h5>
                <Formik
                  validateOnChange={false} validateOnBlur={true} initialValues={{subtask: subtask}}
                  onSubmit={(values) => {
                    dispatch(editChecklistSubtask({sectionId: sectionId, subtask: values.subtask}))
                  }}
                >
                  {({ submitForm }) => (
                    <Form>
                      <Field  component={TextField} name="subtask"/>
                      <Button variant="contained" style={{marginTop: 10}} onClick={submitForm}>Save</Button>
                    </Form>
                  )}
                </Formik>
              </Paper>
            )
          })
        }
      </List>
    )
  }
  
  // Properties container using Paper and Grid with Property Title and List for rendering custom sub-property content
  return (
    <Paper square variant="outlined"className={classes.propertiesPaper}>
      <Grid container  direction="column" justify="flex-start" alignItems="center">
        <Grid item xs>
        <h3 style={{marginTop: 10}}>{(propertyAddMode ? 'Add ' : 'Edit ') + title}</h3>
        </Grid>
        <List className={classes.innerDiv}>
          {renderProperties}
        </List>
      </Grid>
    </Paper>
  )
}

const mapStateToProps = (state) => ({
  propertiesData: state.propertiesData,
})

export default connect(mapStateToProps) (Properties)