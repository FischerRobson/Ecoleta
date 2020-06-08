import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'

import './style.css'

import { Link, useHistory } from 'react-router-dom'

import logo from '../../assets/logo.svg'

import { Map, TileLayer, Marker} from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

import api from '../../services/api'

import axios from 'axios'

import Dropzone from '../../components/Dropzone'

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface UFIBGE {
    sigla: string
}

interface CityIBGE {
    nome: string
}

const CreatePoint = () => {

    const [itens, setItens] = useState<Item[]>([])
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
    const [initialPosition, setInicialPosition] = useState<[number, number]>([-22.5836998,-47.3217262])

    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')

    const [selectedFile, setSelectedFile] = useState<File>()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectedItens, setSelectedItens] = useState<number[]>([])

    const history = useHistory()

    useEffect( ()=> {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords

            setInicialPosition([latitude, longitude])
        })
    }, [])

    useEffect( () => {
        api.get('itens').then(res => {
            setItens(res.data)
            //console.log(res.data)
        })
    }, [] ) //array vazio faz a função se repetir uma unica vez

    useEffect( ()=> {
        axios.get<UFIBGE[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
            const ufInitials = res.data.map( uf => uf.sigla)

            setUfs(ufInitials)
        })
    }, [])

    useEffect( () => {
        axios.get<CityIBGE[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(res => {
            const cityNames = res.data.map( city => city.nome)

            setCities(cityNames)
        })
    }, [selectedUf] )

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value

        setSelectedUf(uf)
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value

        setSelectedCity(city)
    }

    function handleMapClick (event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleInputChange (event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target
        setFormData({ ...formData, [name]: value })
    }


    function handleSelectItem (id: number) {
        const alreadySelected = selectedItens.findIndex(item => item === id)

        if(alreadySelected >= 0){
            const filteredItens = selectedItens.filter(item => item !== id)
            setSelectedItens(filteredItens)
        }else {
            setSelectedItens([...selectedItens, id])
        }
    }

    async function handleSubmit (event: FormEvent) {
        event.preventDefault()


        const { name, email, whatsapp} = formData
        const uf = selectedUf
        const city = selectedCity
        const [latitude, longitude] = selectedPosition
        const itens = selectedItens

        const data = new FormData()
        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('itens', itens.join(', '))
        
        if(selectedFile){
            data.append('file', selectedFile)
        }


        /*const data = {
            name, email, whatsapp, uf, city, latitude, longitude, itens
        }*/

        await api.post('points', data)
        alert('Cadastrado com Sucesso!')

        history.push('/')
    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                
                <Link to="/">
                    Voltar para Home
                </Link>

            </header>

            <form onSubmit={handleSubmit} >
                <h1>Cadastro do <br/>Ponto de Coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input type="text"
                         name="name"
                          id="name"
                          onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email"
                            name="email"
                             id="email"
                             onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleInputChange}/>
                        </div>  
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={ selectedPosition } />
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                                
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">Selecione a cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                                
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="itens-grid">
                        {itens.map(item => (
                            <li key={item.id}
                             onClick={ () => handleSelectItem(item.id)}
                             className={selectedItens.includes(item.id) ? 'selected' : ''} >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))} 
                    </ul>

                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>


            </form>

        </div>
    )
    
}

export default CreatePoint