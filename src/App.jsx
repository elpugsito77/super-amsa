import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, FileDown, Table, ShoppingCart, AlertCircle, Camera, Upload, X, Trash2, Sparkles, CheckSquare, Search, Download, LogIn } from 'lucide-react';

// Login Component
const LoginComponent = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'max' && password === '12345678') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="bg-orange-100 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-orange-600" />
          <h1 className="text-3xl font-bold text-orange-900 mt-4">Mini Super Amsa</h1>
          <p className="text-orange-700">Por favor, inicia sesión</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-orange-800">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-orange-900 bg-orange-50 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Usuario"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-orange-800">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 mt-2 text-orange-900 bg-orange-50 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-sm text-center text-red-600">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full py-3 font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LogIn size={20} />
          Entrar
        </button>
      </div>
    </div>
  );
};


// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to hold the image files and their previews
  const [imageFiles, setImageFiles] = useState([]);
  // State to hold the parsed items from the receipt (local state)
  const [items, setItems] = useState([]);
  // State for the search query
  const [searchQuery, setSearchQuery] = useState('');
  // State for any error messages
  const [error, setError] = useState('');
  // State for AI processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  // State for camera modal
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  // State to hold the camera stream object
  const [cameraStream, setCameraStream] = useState(null);
  // State for PWA installation prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  // State to manage which cell is being edited
  const [editingCell, setEditingCell] = useState(null);
  
  // Refs for camera elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Effect for PWA installation capability
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);


  // Dynamically load scripts and set up PWA
  useEffect(() => {
    // 1. Load XLSX script
    const xlsxScript = document.createElement('script');
    xlsxScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    xlsxScript.async = true;
    document.head.appendChild(xlsxScript);

    // 2. Create and inject the Web App Manifest
    const manifest = {
      short_name: "Ticket Scanner", name: "Mini Super Amsa",
      icons: [{ src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2VhNTgwNSI+PHBhdGggZD0iTTcgMThjLTEuMSAwLTIgLjktMiAydi41YzAgLjI4LjIyLjUuNS41aDE3Yy4yOCAwIC41LS4yMi41LS41VjRjMC0xLjEtLjktMi0yLTJIN2MtMS4xIDAtMiAuOS0yIDJ2M2guMThjLjQ1IDAgLjg1LjMyLjkyLjczbC43MiA0LjI3Yy4wOC40My0uMjUuODUtLjY5Ljg1SDV2Mi41YzAgLjI4LjIyLjUuNS41aDEuNWMuMjggMCAuNS0uMjIuNS0uNVYxOGgzem0xMC00LjVjLS44MyAwLTEuNS0uNjctMS41LTEuNVMxNi4xNyAxMiAxNyAxMmMuODMgMCAxLjUuNjcgMS41IDEuNVMxNy4xMyAxMy41IDE3IDEzLjV6bS03IDBjLS44MyAwLTEuNS0uNjctMS41LTEuNVM5LjE3IDEyIDEwIDEycyAxLjUuNjcgMS41IDEuNVMxMC4xMyAxMy41IDEwIDEzLjV6TTcgNGgxMHYzaC0xLjY5Yy0uNDUtLjAxLS44Ni4zMS0uOTMuNzVsLS43MiA0LjI1Yy0uMDguNDUgLjI0Ljg1LjY5Ljg1SDE5djMuNUg3VjR6Ii8+PC9zdmc+", type: "image/svg+xml", sizes: "512x512" }],
      start_url: ".", display: "standalone", theme_color: "#fff7ed", background_color: "#fff7ed"
    };
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(xlsxScript)) document.head.removeChild(xlsxScript);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // Effect to handle attaching the stream to the video element
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  /**
   * Converts a file to a base64 string.
   */
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  /**
   * Processes a batch of image files using the Gemini AI model.
   */
  const processImageBatchWithAI = async (files) => {
    if (!files || files.length === 0) return;

    setError('');
    setIsProcessing(true);
    let allProcessedItems = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus(`Escaneando ticket ${i + 1} de ${files.length}...`);
        
        const base64ImageData = await toBase64(file);
        
        const prompt = `Analiza la imagen de este ticket de compra con extrema precisión, especialmente con los números de precios y códigos. Extrae la lista de productos. Cada producto debe tener su código, nombre, cantidad y precio total. Verifica dos veces que los precios extraídos coincidan exactamente con los de la imagen. Devuelve un objeto JSON con una propiedad "productos" que es un array de objetos.`;

        const schema = {
          type: "OBJECT",
          properties: {
            productos: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  codigo: { "type": "STRING", "description": "El código numérico del producto." },
                  nombre: { "type": "STRING", "description": "El nombre completo del producto." },
                  cantidad: { "type": "STRING", "description": "La cantidad completa (ej. '3 pz')." },
                  precioTotal: { "type": "NUMBER", "description": "El precio total del renglón." }
                },
                required: ["codigo", "nombre", "cantidad", "precioTotal"]
              }
            }
          }
        };

        const payload = {
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: base64ImageData } }
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        };

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCfyaDQA8p8m_kx-_sVzZGmcVtcm4PfETw"; // Use your API key here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error de la API: ${response.statusText}`);

        const result = await response.json();
        
        if (result.candidates && result.candidates[0].content.parts[0].text) {
            const jsonText = result.candidates[0].content.parts[0].text;
            const resultData = JSON.parse(jsonText);
            const newItems = resultData.productos || [];
            
            if (Array.isArray(newItems)) {
                const processedNewItems = newItems.map(item => {
                    const quantityStr = String(item.cantidad || '1');
                    const quantityNumMatch = quantityStr.match(/[\d.]+/);
                    const quantityNum = quantityNumMatch ? parseFloat(quantityNumMatch[0]) : 1;
                    const total = item.precioTotal || 0;
                    const unitPrice = (quantityNum > 0) ? total / quantityNum : total;
                    
                    return {
                        id: crypto.randomUUID(),
                        codigo: item.codigo || 'N/A',
                        nombre: item.nombre || 'Producto desconocido',
                        cantidad: quantityStr,
                        precioTotal: total,
                        precioPorUnidad: unitPrice,
                        isChecked: false
                    };
                });

                const uniqueNewItems = processedNewItems.filter(newItem => 
                    newItem.codigo !== 'N/A' && !allProcessedItems.some(existingItem => 
                        existingItem.codigo === newItem.codigo
                    )
                );
                
                allProcessedItems = [...allProcessedItems, ...uniqueNewItems];
            }
        } else {
            console.warn("La IA no devolvió datos para la imagen " + (i + 1));
        }
      }
      setItems(allProcessedItems);
      setProcessingStatus('¡Escaneo completado!');
    } catch (err) {
      setError(`Ocurrió un error durante el escaneo: ${err.message}.`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartScan = () => {
    if (imageFiles.length > 0) {
      const filesToProcess = imageFiles.map(img => img.file);
      processImageBatchWithAI(filesToProcess);
    }
  };

  const handleToggleCheck = (idToToggle) => {
    const updatedItems = items.map((item) => {
        if (item.id === idToToggle) {
            return { ...item, isChecked: !item.isChecked };
        }
        return item;
    });
    setItems(updatedItems);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        const newImageFiles = files.map(file => ({
            id: crypto.randomUUID(),
            file: file,
            preview: URL.createObjectURL(file)
        }));
        setImageFiles(prev => [...prev, ...newImageFiles]);
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("La API de la cámara no es compatible con este navegador.");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setCameraStream(stream);
        setIsCameraOpen(true);
    } catch (err) {
        console.error("Error al acceder a la cámara: ", err);
        setError("No se pudo acceder a la cámara. Asegúrate de haber dado los permisos necesarios.");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        closeCamera();
        
        canvas.toBlob(blob => {
            const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
            const newImageFile = {
                id: crypto.randomUUID(),
                file: file,
                preview: URL.createObjectURL(file)
            };
            setImageFiles(prev => [...prev, newImageFile]);
        }, 'image/jpeg');
    }
  };

  const handleDeleteImage = (idToDelete) => {
      setImageFiles(prev => prev.filter(img => img.id !== idToDelete));
  };

  const handleExportExcel = () => {
    if (typeof window.XLSX === 'undefined') {
      setError('La librería para exportar (XLSX.js) aún no está cargada.');
      return;
    }
      
    if (items.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const dataToExport = items.map(item => ({
      'Registrado': item.isChecked ? 'Sí' : 'No', 'Código': item.codigo, 'Producto': item.nombre,
      'Cantidad': item.cantidad, 'Precio por Unidad ($)': item.precioPorUnidad.toFixed(2), 'Precio Total ($)': item.precioTotal.toFixed(2),
    }));
    
    const totalCost = items.reduce((sum, item) => sum + item.precioTotal, 0);
    dataToExport.push({});
    dataToExport.push({ 'Producto': 'TOTAL', 'Precio Total ($)': totalCost.toFixed(2) });

    const worksheet = window.XLSX.utils.json_to_sheet(dataToExport);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Compras');
    worksheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
    window.XLSX.writeFile(workbook, 'lista_de_compras.xlsx');
  };

  const handleClear = () => {
    setImageFiles([]);
    setItems([]);
    setError('');
    setProcessingStatus('');
    setSearchQuery('');
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  const handleCellEdit = (itemId, field, newValue) => {
    const updatedItems = items.map(item => {
        if (item.id === itemId) {
            const updatedItem = { ...item };
            
            if (field === 'precioTotal') {
                const parsedValue = parseFloat(newValue) || 0;
                updatedItem.precioTotal = parsedValue;
                const quantityStr = String(updatedItem.cantidad || '1');
                const quantityNumMatch = quantityStr.match(/[\d.]+/);
                const quantityNum = quantityNumMatch ? parseFloat(quantityNumMatch[0]) : 1;
                updatedItem.precioPorUnidad = (quantityNum > 0) ? parsedValue / quantityNum : parsedValue;
            } else {
                updatedItem[field] = newValue;
            }
            return updatedItem;
        }
        return item;
    });

    setItems(updatedItems);
    setEditingCell(null);
  };

  const handleKeyDown = (e, itemId, field) => {
    if (e.key === 'Enter') {
      handleCellEdit(itemId, field, e.target.value);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    (item.nombre && item.nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.codigo && item.codigo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalGeneral = items.reduce((sum, item) => sum + (item.precioTotal || 0), 0);
  
  if (!isAuthenticated) {
    return <LoginComponent onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="bg-orange-100 text-orange-900 min-h-screen font-sans p-4 sm:p-6 md:p-8">
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-4xl h-auto rounded-lg shadow-lg mb-4"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="flex items-center gap-4">
              <button onClick={takePicture} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full flex items-center gap-3 transition-transform transform hover:scale-105 shadow-lg">
                  <Camera size={24} />
                  <span>Tomar Foto</span>
              </button>
              <button onClick={closeCamera} className="bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-full transition-transform transform hover:scale-105 shadow-lg">
                  <X size={24} />
              </button>
            </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <ShoppingCart className="w-10 h-10 text-orange-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-orange-900">Mini Super Amsa</h1>
          </div>
          <p className="text-orange-700 mt-2">Scanner Creado Por D.A.C.L</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-4">
             <button onClick={openCamera} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                <Camera size={20} />
                <span>Abrir Cámara</span>
             </button>
             <label htmlFor="image-upload" className={`bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-md ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}>
                <Upload size={20} />
                <span>Subir Foto(s)</span>
             </label>
             <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={isProcessing} multiple />
             <button onClick={handleStartScan} disabled={isProcessing || imageFiles.length === 0} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                <Sparkles size={20} />
                <span>Iniciar Escaneo</span>
            </button>
            {installPrompt && (
                <button onClick={handleInstallClick} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md">
                    <Download size={20} />
                    <span>Instalar App</span>
                </button>
            )}
          </div>
          {isProcessing && (
            <div className="mt-4 text-center">
              <p className="text-orange-600 font-semibold mb-2">{processingStatus}</p>
              <div className="w-full bg-orange-200 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          {imageFiles.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-medium text-orange-800 mb-3 text-center">Fotos Cargadas</h3>
                <div className="flex flex-wrap justify-center gap-4 p-4 bg-orange-100/50 rounded-lg">
                    {imageFiles.map(img => (
                        <div key={img.id} className="relative w-24 h-24">
                            <img src={img.preview} alt="Miniatura de ticket" className="w-full h-full object-cover rounded-md shadow-md" />
                            <button 
                                onClick={() => handleDeleteImage(img.id)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
                                aria-label="Eliminar imagen"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5"/>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {items.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-orange-900"><Table/> Resumen de Compra</h2>
                <span className="bg-orange-200 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">{items.length} Artículos</span>
              </div>
              <button onClick={handleExportExcel} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md">
                <FileDown size={20} />
                Exportar a Excel
              </button>
            </div>

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre o código..."
                    className="w-full bg-orange-50 border border-orange-300 rounded-lg py-2.5 px-4 pl-10 text-orange-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={20} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="p-4 text-sm font-semibold uppercase text-orange-600 rounded-tl-lg w-12 text-center">
                        <CheckSquare size={18}/>
                    </th>
                    <th className="p-4 text-sm font-semibold uppercase text-orange-600">Código</th>
                    <th className="p-4 text-sm font-semibold uppercase text-orange-600">Producto</th>
                    <th className="p-4 text-sm font-semibold uppercase text-orange-600">Cantidad</th>
                    <th className="p-4 text-sm font-semibold uppercase text-orange-600 text-right">Precio por Unidad</th>
                    <th className="p-4 text-sm font-semibold uppercase text-orange-600 text-right rounded-tr-lg">Precio Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={`border-b border-orange-200 transition-colors ${item.isChecked ? 'bg-orange-200/60 text-orange-500 line-through' : 'hover:bg-orange-50/50'}`}>
                      <td className="p-4 text-center">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-orange-300 bg-orange-100 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            checked={item.isChecked}
                            onChange={() => handleToggleCheck(item.id)}
                        />
                      </td>
                      <td className={`p-4 font-mono ${item.isChecked ? '' : 'text-orange-800'}`}>{item.codigo}</td>
                      <td className={`p-4 font-medium cursor-pointer ${item.isChecked ? '' : 'text-orange-900'}`} onClick={() => setEditingCell({ id: item.id, field: 'nombre' })}>
                        {editingCell && editingCell.id === item.id && editingCell.field === 'nombre' ? (
                          <input type="text" defaultValue={item.nombre} autoFocus onBlur={(e) => handleCellEdit(item.id, 'nombre', e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, 'nombre')} className="bg-orange-100 w-full p-1 rounded" />
                        ) : ( item.nombre )}
                      </td>
                      <td className={`p-4 cursor-pointer ${item.isChecked ? '' : 'text-orange-800'}`} onClick={() => setEditingCell({ id: item.id, field: 'cantidad' })}>
                        {editingCell && editingCell.id === item.id && editingCell.field === 'cantidad' ? (
                          <input type="text" defaultValue={item.cantidad} autoFocus onBlur={(e) => handleCellEdit(item.id, 'cantidad', e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, 'cantidad')} className="bg-orange-100 w-full p-1 rounded" />
                        ) : ( item.cantidad )}
                      </td>
                      <td className={`p-4 text-right font-mono ${item.isChecked ? '' : 'text-orange-800'}`}>${item.precioPorUnidad.toFixed(2)}</td>
                      <td className={`p-4 font-bold text-right font-mono cursor-pointer ${item.isChecked ? '' : 'text-orange-600'}`} onClick={() => setEditingCell({ id: item.id, field: 'precioTotal' })}>
                        {editingCell && editingCell.id === item.id && editingCell.field === 'precioTotal' ? (
                          <input type="number" step="0.01" defaultValue={item.precioTotal} autoFocus onBlur={(e) => handleCellEdit(item.id, 'precioTotal', e.target.value)} onKeyDown={(e) => handleKeyDown(e, item.id, 'precioTotal')} className="bg-orange-100 w-full p-1 rounded text-right" />
                        ) : ( `$${item.precioTotal.toFixed(2)}` )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                    <tr className="bg-orange-50 font-bold">
                        <td colSpan="5" className="p-4 text-right text-lg uppercase text-orange-900 rounded-bl-lg">Total General</td>
                        <td className="p-4 text-xl text-right text-orange-700 font-mono rounded-br-lg">${totalGeneral.toFixed(2)}</td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
