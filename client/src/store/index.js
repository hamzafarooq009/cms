import { configureStore } from '@reduxjs/toolkit'
import taskDataReducer from '../features/task-management/taskdataSlice'
import formDataReducer from '../features/form-management/formDataSlice'
import formTemplateReducer from '../features/form-management/formTemplateSlice'


export default configureStore({
  reducer: {
    taskData: taskDataReducer,
    formTemplate: formTemplateReducer,
    formData: formDataReducer
  },
})
