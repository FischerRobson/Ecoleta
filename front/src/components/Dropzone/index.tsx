import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import './style.css'
import { FiUpload } from 'react-icons/fi'

interface Props {
  onFileUploaded: (file: File) => void
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {

    const [selectFileUrl, setSelectedFileUrl] = useState('')

    const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0]

    const fileUrl = URL.createObjectURL(file)
    setSelectedFileUrl(fileUrl)
    
    onFileUploaded(file)
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
      onDrop,
      accept: 'image/*'
    })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps() } accept="image/*"/>

        { selectFileUrl
            ?  <img src={selectFileUrl} alt="point tumbnail" />
            : (
            <p>
              < FiUpload />
              Imagem do estabelecimento
           </p>)
        }

      
    </div>
  )
}

export default Dropzone