import React, { useState } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';
import Slider from '@mui/material/Slider';
import { getCroppedImg } from '../RecortarImagen.js';
import '../../assets/css/Registro.css'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const RegistroClub = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    user_id: 1
  });

  const [errors, setErrors] = useState({}); // Estado para errores
  const [image, setImage] = useState(null);
  const [tempImage, setTempImage] = useState(null); 
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar errores al cambiar el valor
    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: ''
    }));
  };

  // Validación de los campos
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre) {
      newErrors.nombre = 'El nombre del club es obligatorio';
    }
    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción del club es obligatoria';
    }
    return newErrors;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImage(file);
      setImagePreview(URL.createObjectURL(file));
      setModalIsOpen(true);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar antes de enviar
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('descripcion', formData.descripcion);
    data.append('user_id', formData.user_id);
    if (croppedImage) {
      data.append('image', croppedImage);
    } else if (image) {
      data.append('image', image);
    }

    try {
      const response = await axios.post('http://localhost:5002/api/club/post_club', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      toast.success('Registrado con éxito');
      navigate('/clubes/indice');
    } catch (error) {
      toast.error('error')
      console.error('Error al crear el club:', error);
    }
  };

  const handleCropConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels, 200, 200);
      setCroppedImage(croppedImage);
      setImage(URL.createObjectURL(croppedImage));
      setImagePreview(URL.createObjectURL(croppedImage));
      setModalIsOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    setModalIsOpen(false);
    setTempImage(null);
    setImagePreview(null); 
    document.getElementById('image').value = ''; 
  };

  return (
    <div className="registro-campeonato">
      <h2>Registrar Club</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={errors.nombre ? 'error' : ''}
          />
          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Descripción"
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={errors.descripcion ? 'error' : ''}
          />
          {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
        </div>
        <div className="form-group">
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            className="file-input"
          />
          <label htmlFor="image" className="file-label">
            <span className="file-button"><i className="fa fa-image"></i></span>
            <span className="file-name">{imagePreview ? "Archivo seleccionado" : "Sin archivos seleccionados"}</span>
          </label>
        </div>
        {imagePreview && (
          <div className="form-group">
            <img src={imagePreview} alt="Vista previa de la imagen" className="image-preview" />
          </div>
        )}
        <div className="form-group">
          <button id="RegCampBtn" type="submit">Registrar</button>
        </div>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCancel}
        contentLabel="Crop Image"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Edita la imagen</h2>
        <div className="crop-container">
          <Cropper
            image={imagePreview}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="controls">
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, zoom) => setZoom(zoom)}
          />
        </div>
        <div className="buttons">
          <button className='bottonsImageCancel' onClick={handleCancel}>Cancelar</button>
          <button className='bottonsImage' onClick={handleCropConfirm}>Aplicar</button>
        </div>
      </Modal>
    </div>
  );
};

export default RegistroClub;
