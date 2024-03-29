import React, {useState} from 'react'
import { connect } from 'react-redux'
import AttachRequestForm from './AttachRequestForm'
import TaskStatus from './TaskStatus'
import CheckList from "./CheckList"
import LogEditor from "../logs/CreateLog"
import { archiveTask, taskOwnerChange, updateTitle, updateDescription, createRequestTask,
  createCustomTask, changeTaskStatus, setTaskEditMode, setCurrTaskId } from "../taskDataSlice"
import { Typography, Box, Card, Slide, FormControl, Select, TextField, MenuItem, Grid, Dialog, DialogActions, Button, Tooltip, Fab } from '@material-ui/core'
import SubjectIcon from '@material-ui/icons/Subject'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import ArchiveIcon from '@material-ui/icons/Archive'

/**
  This component handles the Edit and Create Mode of a Task. All the fields in an Edit Task Window or a Create Task Window
  are controlled by this sibling(component) of the Task Manager Component.     

  @param {string} editMode if editMode === "create", the create task dialog is opened, if editMode === "edit", the edit task dialog is opened 
  @param {bool} isRequestTask a bool passed, telling us whether the current task, be it in create ir edit mode, is a "request task" or a "custom task"
  @param {string} ownerId the ID of the owner of the current task, in case of editMode === "create", the ownerId is not passed
  @param {list} taskList slice from redux containing data of all the currently active tasks
  @param {string} taskId this is the Id of the task whom the user wants to edit, , in case of editMode === "create", the taskId is not passed
  @param {list} ccaDetails slice from redux containing data of all the active members of CCA
  @param {bool} open a bool state passed to open the Edit or Create Dialog Box
**/

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export function EditTaskDialog({editMode, ownerId, isRequestTask, taskList, taskId, ccaDetails, dispatch, open}) {  
  let initialState = { description: "", title: "", ownerId: -1, submissionId: -1, statusId: -1, log: "" }

  const taskObj = taskList.find(taskObj => taskObj.taskId === taskId)
  if (taskObj !== undefined) { // if found
    const { description, title, ownerId, submissionId, statusId } = taskObj
    initialState = { description, title, ownerId, submissionId, statusId }
  }

  const [selectOpen, setSelectOpen] = useState(false)  
  const [desc, setDesc] = useState(initialState.description)
  const [taskTitle, setTaskTitle] = useState(initialState.title)
  const [owner, setOwner] = useState(initialState.ownerId)
  const [statusId, setStatusId] = useState(initialState.statusId)
  const [localSubmissionId, setLocalSubmissionId] = useState(initialState.submissionId)
  
  function handleOwnerSet(event) {
    setOwner(event.target.value)
  }

  function handleTaskEditorClose() {
    dispatch(setCurrTaskId({taskId: ""}))
    dispatch(setTaskEditMode({taskEditMode: ""}))
  }

  async function handleDelete() {
    await dispatch(archiveTask({taskId, ownerId}))
    // dispatch(fetchTaskManager())
    handleTaskEditorClose()
  }

  function handleCreateComplete(){
    if (isRequestTask) {      
      const reqTaskObject = { 
        title: taskTitle, 
        description: desc, 
        submissionId: localSubmissionId,
        ownerId: owner, 
        statusId: statusId,
        archive: false
      }
      dispatch(createRequestTask(reqTaskObject))
    } 
    else {
      const cusTaskObject = { 
        title: taskTitle, 
        description: desc, 
        ownerId: owner, 
        statusId: statusId,
        archive: false
      }
      dispatch(createCustomTask(cusTaskObject))
    }
    setDesc("")
    setTaskTitle("")
    setOwner(-1)
    setLocalSubmissionId(-1)
    setStatusId(-1)
    handleTaskEditorClose()
  }
  
  function handleSaveEdits() {
    if (editMode) {
      if (initialState.title !== taskTitle) {
        dispatch(updateTitle({taskId, newTitle: taskTitle}))
      }
      if (initialState.description !== desc) {
        dispatch(updateDescription({taskId, desc}))
      }
      if (initialState.ownerId !== owner) {
        dispatch(taskOwnerChange({taskId, owner}))
      }
      if (initialState.statusId !== statusId) {
        dispatch(changeTaskStatus({taskId, statusId}))
      }
      // if (logText.length > 0) {
      //   dispatch(createNewLog({taskId, logText}))
      // }
    }
    handleTaskEditorClose()
  }

  function RequestVSCustom() { // conditionally render "Checklist" and Request Form Button
    return (
      <Grid container direction="row" justify="space-between" alignItems="flex-start" style={{padding: "0px 17px 0px 17px"}}>
        <Grid item>
          { 
            (() => {
              if (!editMode) {
                return <Typography gutterBottom variant="h5" color="inherit">
                  Checklist:
                </Typography> 
              }
            })()
          }
        </Grid>
        <Grid item>
          {
            (localSubmissionId === -1 && !editMode) ?
            <AttachRequestForm ownerId={ownerId} setLocalSubmissionId={setLocalSubmissionId}/> :
            <Typography variant="h6">
              Linked Request ID: {localSubmissionId}
            </Typography>
          }
        </Grid>
      </Grid>
    )
  }

  function AssignTaskOwner() { // Give Select Option to Add Task Assignee
    return (
      <Grid container direction="row" justify='flex-start' alignItems="flex-start">
        <Typography style={{marginRight: 5}} gutterBottom variant="h6" color="inherit">
          Task Owner:    
        </Typography>
        <FormControl>
          <Select
            labelId = "select-label"
            id="label"
            open={selectOpen}
            onClose={()=>setSelectOpen(false)}
            onOpen={()=>setSelectOpen(true)}
            value={owner}
            onChange={handleOwnerSet}
            variant = "outlined"
            style={{height: 30, width: "100%",  marginTop: 3}}
          >
            <MenuItem value={owner}>
              <em>None</em>
            </MenuItem>
            {
              ccaDetails.map((ccaUser, index) => 
                <MenuItem key={index} value={ccaUser.ccaId}>{ccaUser.firstName}</MenuItem> 
              )
            }
          </Select>
        </FormControl>
      </Grid>
    )
  }

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={handleTaskEditorClose} TransitionComponent={Transition}>
      {/* TaskName----TaskID----TaskArchiveButton */}
      <Grid style={{padding: "15px"}} item container direction="row" justify="space-between" alignItems="flex-start">
        <Typography gutterBottom variant="h5" color="inherit">
          <Grid container direction="row"> 
            <Typography variant="h5" style={{marginTop: 5}}>Task Name:</Typography>
            <TextField 
              id="task-title"
              variant="outlined"
              value={taskTitle}
              onChange={(e)=>{setTaskTitle(e.target.value)}}
              style={{resize: "none", marginTop: -8, marginLeft: 4, size:"small", outline: "none"}}
            />
          </Grid>
            <Typography gutterBottom variant="h6" color="textPrimary">
              ID: {taskId}
          </Typography>
        </Typography>
        <Grid>
          {
            editMode
            ? <Tooltip title="Archive Task" placement="bottom-end"> 
                <Fab size="small" color="primary">
                  <ArchiveIcon cursor="pointer" onClick={handleDelete} fontsize="large"/>
                </Fab>
              </Tooltip>
            : <CancelOutlinedIcon cursor="pointer" onClick={handleTaskEditorClose} /> 
          }
        </Grid>
      </Grid>

      {/*Description Box*/}
      <Box padding= {2} marginTop={-2}>
        <Typography gutterBottom variant="h6" color="inherit" style={{marginLeft:27}}>
          <Typography style={{marginLeft: -30, marginBottom: -36}}>
            <SubjectIcon fontSize={"large"}/>
          </Typography>
          Description
        </Typography>
        <Card>
          <TextField 
            placeholder={"Add description here..."}
            multiline
            rows="5"
            value={desc}
            variant="outlined"
            onChange={(e)=>setDesc(e.target.value)}
            // inputProps={{onBlur: handleDescChange}}
            style={{
              resize: "none",
              width: "100%",
              overflow: "hidden",
              outline: "none",
              border: "none",
            }}
          />
        </Card>
      </Box>
          
      <Grid container direction="row" justify="space-between" alignItems="flex-start" style={{padding: "0px 17px 0px 17px"}}>
        <Grid item style={{marginBottom: 20}}> {/*Assign Task Owner*/}
          <AssignTaskOwner/>
        </Grid>
        <Grid item style={{marginTop: 5}}> {/*Task Status Colors*/}
          <TaskStatus setStatusId={setStatusId} taskId={taskId}/>
        </Grid>
      </Grid>
        
      {
        isRequestTask && /*CheckList Text (and checklist) and Request Task Button conditionally rendered*/
        <div>
          <RequestVSCustom/>
          {
            (localSubmissionId !== -1) 
            ? <Grid item style={{padding: "0px 17px 0px 17px", marginTop: -10}}>
                <CheckList taskId={taskId}/>
              </Grid>
            : <h6 style={{marginTop: -1, marginLeft: 17}}>No Request Attached</h6>
          }
        </div>
      }

      {
        editMode && //Logs
        <LogEditor taskId={taskId}/>
      }
      {/*Complete Task Button*/}
      <DialogActions>
        <div style={{marginRight: 10}}>
          {
            (!editMode) &&  
              <Button 
                variant="contained" 
                color="inherit"
                onClick={handleCreateComplete}
              >
                Create Task
              </Button>
          }
          {
            (editMode) && 
              <Button 
                  variant="contained" 
                  color="inherit"
                  onClick={handleSaveEdits}
                >
                  Save Edits
              </Button>
          }
        </div>
      </DialogActions>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  taskList: state.taskData.taskList,
  ccaDetails: state.ccaDetails.ccaList,
  taskView: state.taskView
})

export default connect(mapStateToProps)(EditTaskDialog)