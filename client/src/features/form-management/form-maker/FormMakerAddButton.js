import React from 'react'
import { Button } from '@material-ui/core'
import Icon from '@material-ui/core/Icon'
import {useDispatch} from 'react-redux'
import { setPropertyWindow } from '../propertiesDataSlice'

/**
  A conditional Add button for adding Items, Sections or Components based on the type passed in.

  @param {string} type can be 'add-item', 'component' or 'section'
  @param {number} parentId id of the parent of the attached component
*/

export default function FormMakerAddButton({type, parentId}) {
  const dispatch = useDispatch()
  function viewAddItem(){
    dispatch(setPropertyWindow({propertyType: 'add-item', propertyAddMode: true, parentId})) //different property window from edit one
  }

  function viewAddComponent(){
    dispatch(setPropertyWindow({propertyType: 'component', propertyAddMode: true, parentId}))
  }

  function viewAddSection(){
    dispatch(setPropertyWindow({propertyType: 'section', propertyAddMode: true, parentId}))
  }

  const buttonStyle = {
    cursor: "pointer",
    borderRadius: 3,
    opacity: 0.7,
    width: 300 
  }

  
  let clickHandler = viewAddItem
  switch(type){
    case "component":
      clickHandler = viewAddComponent
      break
    case "section":
      clickHandler = viewAddSection
      break
    default:
      clickHandler = viewAddItem
      break
  }
  
  return <Button variant='outlined' onClick={clickHandler} style={buttonStyle} startIcon={<Icon >add</Icon>}>add {type}</Button>
}