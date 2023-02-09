const { contextBridge, ipcRenderer } = require('electron');

const lsl = require('lsl.js')
const dgram = require('dgram');

var FormData = require('form-data');
var fs = require('fs');
const axios = require('axios').default;
const path = require('path')
var CryptoJS = require("crypto-js");

// Connection 
const protocol = 'http'
const url = 'localhost'
const port = '8080'

// LSL Device stream
let streamsEEG = null;
let streamInletEEG = null;
let timeCorrection = 0

// LSL Stimulus stream
let streamsStimulus = null


// UDP Stimulus stream
let server = null


let recording = false
let volts = []

let rate = 0;
let interval;

let cont = 0

let dataInput = []
let timestamp = []
let stimuli = []
let stimuliAlwaysMemory = []


    const getDataFromLSL = () => {
			const { samples, data, timestamps, dataOriginal } = streamInletEEG.pullChunk()

			if (samples > 0) {
				for (let i = 0; i < data.length; i++) {
					for (let j = 0; j < timestamps.length; j++) {
						volts[i].shift()
						volts[i].push({pv:data[i][j]})
					}
				}

				if (recording) {
					dataInput.push(dataOriginal)
					timestamp = timestamp.concat(timestamps)
					if (timestamp.length > 30000) {
						fs.writeFileSync(`tmp/temp_file_${cont}.json`, JSON.stringify({dataInput, timestamp, stimuli}))
						initArraysRecording()
						cont++;
					}
				}
			}
    }


    
const changeWindowTime = (sec) => {
    initArrays(volts.length, sec)
}


const initArrays = (numChannels, time) => {
    volts = []
    for (let i = 0; i < numChannels; i++) {
        let channel = Array(rate*time).fill({pv:0})
        volts.push(channel)
    }

}

const initArraysRecording = () => {
    dataInput = []
    timestamp = []
    stimuli = []
}

const clear = () => {

    streamsEEG = null;
    streamInletEEG = null;
    timeCorrection = 0
    
    // LSL Stimulus stream
    streamsStimulus = null
    
    // UDP Stimulus stream
    server = null
    
    
    recording = false
    volts = []
    
    rate = 0;
    if (interval)
        clearInterval(interval);

    dataInput = []
    timestamp = []
    stimuli = []
    stimuliAlwaysMemory = []

    fs.readdir('tmp', (err, files) => {
        files.forEach(file => {
            fs.unlink(path.join('tmp', file), err => {
                if (err) throw err;
              });
          
        });
    })
    cont = 0
}
contextBridge.exposeInMainWorld('api', {


    start: () => {

        if (streamsEEG !== null && streamsEEG.length > 0) {
            streamInletEEG = new lsl.StreamInlet(streamsEEG[0]);
            //timeCorrection = streamInletEEG.timeCorrection()
            interval = setInterval(getDataFromLSL, 0);
        } 
    },

    stop: () => {
        if (streamInletEEG !== null) {
            clearInterval(interval);
            //streamInletEEG = null;
        }
    },

    startStimulusLSLRecording: () => {
        if (streamsStimulus !== null && streamsStimulus.length > 0) {
            initArraysRecording()
            recording=true
        }
    },

    stopStimulusLSLRecording: () => {
        recording = false

    },

    startStimulusUDPRecording: (port, stimuliParam) => {
			server = dgram.createSocket('udp4');
			server.on('message', (msg, rinfo) => {
				const {stimulus, timestamp} = JSON.parse(msg)
				if (Array.isArray(stimulus)) {
					if (typeof stimulus[0] == 'number' && !isNaN(stimulus[0]) && Number.isInteger(stimulus[0])) {
						if (stimuliParam.filter(l => l.name == stimulus[0]).length === 1) {
							stimuli.push([stimulus, timestamp])
							stimuliAlwaysMemory.push({stimulus: stimulus[0], timestamp: timestamp})
						} else 
							ipcRenderer.send('open_dialog', 
							`Stimulus with value ${stimulus[0]} is not valid. Please, type in a valid stimulus and reset`)
					} else 
						ipcRenderer.send('open_dialog', 'Stimulus data must be a integer value in a array. [int]')
				} else {
					ipcRenderer.send('open_dialog', 'Stimulus data must be a integer value in a array. [int]')
				}
			});

			initArraysRecording()
			server.bind(port);
			recording = true
    },

    stopStimulusUDPRecording: () => {
        server.close();
        server = null
        recording = false
    },
    closeStream: () => {

        streamsEEG = null
        streamInletEEG = null        
        initArrays(volts.length, 5)
        


    },

    closeStreamStimulus: () => {
        streamsStimulus = null

    },

    searchStreams: (element, type) => {
        return new Promise((resolve, reject) => {

            if (element === 'device') {
                streamsEEG = lsl.resolve_byprop('type', type);
                if (streamsEEG === null || streamsEEG.length === 0) {
                    streamsEEG = null
                    resolve(false)
                }
                rate = streamsEEG[0].getNominalSamplingRate()
                initArrays(streamsEEG[0].getChannelCount(), 5)

            } else {
                streamsStimulus = lsl.resolve_byprop('name', type);
                if (streamsStimulus === null || streamsStimulus.length === 0) {
                    streamsStimulus = null
                    resolve(false)
                }
            }
            resolve(true)
          })

    }, 
     
    getVolts: () => {
        if (volts[0] !== undefined)
            return volts
        return undefined

    }, 

    getStimulusReceived: () => {
        
        return stimuliAlwaysMemory
    },
    
    changeWindow: (sec) => {
        changeWindowTime(sec)
    
    }, 

    closeAll: () => {


        clear()
    },

    save: (name, subject_id, subjectName, experiment_id) => {
        
			fs.writeFileSync(`tmp/temp_file_${cont}.json`, JSON.stringify({dataInput, timestamp, stimuli}))
			const form = new FormData();
			let names = fs.readdirSync('tmp')
			for (let i = 0; i < names.length; i++)
				form.append('files', fs.createReadStream(path.join('tmp', names[i])))

			timeCorrection = streamInletEEG.timeCorrection()
            
			ipcRenderer.send('open_dialog', 'Loading...')

            let encJson = CryptoJS.AES.encrypt(subjectName, JSON.parse(localStorage.getItem('privateKey')).toString())
            let subjectCypher = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
            
            
			axios({
				method: 'post',
				url: `${protocol}://${url}:${port}/csv/?name=${name}&subject_id=${subject_id}&subject_name_cypher=${subjectCypher}&experiment_id=${experiment_id}&time_correction=${timeCorrection}`,

				data: form,
				maxBodyLength: Infinity,
				maxContentLength: Infinity,
				headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
				},
				adapter: require('axios/lib/adapters/http')
			})
			.then(response =>  ipcRenderer.send('open_dialog', 'CSV created'))
			.catch((error => ipcRenderer.send('open_dialog', 'CSV not created. Check if stimulus are corrects')))
			.finally(() => clear())     
    },

    applyPreproccessing: (msg) => {
			ipcRenderer.send('open_dialog', 'Loading...')
			//axios.post(`${protocol}://${url}:${port}/csv/preproccessing/list`, msg, { adapter: require('axios/lib/adapters/http')})
            axios({
				method: 'post',
				url: `${protocol}://${url}:${port}/csv/preproccessing/list`,
				data: msg,
				headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
				},
				adapter: require('axios/lib/adapters/http')
			}) 
			.then(response => ipcRenderer.send('open_dialog', response.data))
      .catch(error => ipcRenderer.send('open_dialog', 'A server internal error has occurred'))
    },

    applyIca: (id_csv, msg) => {
        ipcRenderer.send('open_dialog', 'Loading...')

        //axios.post(`${protocol}://${url}:${port}/csv/${id_csv}/ica/apply`, msg, { adapter: require('axios/lib/adapters/http')})
        axios({
            method: 'post',
            url: `${protocol}://${url}:${port}/csv/${id_csv}/ica/apply`,
            data: msg,
            headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
            },
            adapter: require('axios/lib/adapters/http')
        })  
        .then(response => ipcRenderer.send('open_dialog', 'Components excluded correctly'))

        .catch(error => ipcRenderer.send('open_dialog', error.response.data.detail !== undefined ? error.response.data.detail : 'A server internal error has occurred'))
    },

    downloadCSV: (idCSV) => {

        ipcRenderer.send('download-button', {url: `${protocol}://${url}:${port}/csv/${idCSV}/download`}) 
    },

    applyTrainingMachine: (msg) => {
			ipcRenderer.send('open_dialog', 'Loading...')
			//axios.post(`${protocol}://${url}:${port}/training/machine`, msg, { adapter: require('axios/lib/adapters/http')})
            axios({
                method: 'post',
                url: `${protocol}://${url}:${port}/training/machine`,
                data: msg,
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                },
                adapter: require('axios/lib/adapters/http')
            })  
			.then(response => ipcRenderer.send('open_dialog', 'Training model created'))
			.catch(error => 
				ipcRenderer.send('open_dialog', error.response.data.detail !== undefined ? 
				error.response.data.detail : 'A server internal error has occurred'))    
			},
    applyTrainingDeep: (msg) => {
			ipcRenderer.send('open_dialog', 'Loading...')
			//axios.post(`${protocol}://${url}:${port}/training/deep`, msg, { adapter: require('axios/lib/adapters/http')})
            axios({
                method: 'post',
                url: `${protocol}://${url}:${port}/training/deep`,
                data: msg,
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
                },
                adapter: require('axios/lib/adapters/http')
            })  
			.then(response => ipcRenderer.send('open_dialog', 'Training model created'))
			.catch(error => {
				ipcRenderer.send('open_dialog', error.response.data.detail !== undefined ?
				error.response.data.detail : 'A server internal error has occurred')
			})    
    },


    applyFeature: (msg) => {
        ipcRenderer.send('open_dialog', 'Loading...')
        //axios.post(`${protocol}://${url}:${port}/csv/feature/list`, msg, { adapter: require('axios/lib/adapters/http')}) 
        axios({
            method: 'post',
            url: `${protocol}://${url}:${port}/csv/feature/list`,
            data: msg,
            headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
            },
            adapter: require('axios/lib/adapters/http')
        })
        .then(response => ipcRenderer.send('open_dialog', response.data))

        .catch(error => {
            ipcRenderer.send('open_dialog', error.response.data.detail !== undefined ? error.response.data.detail : 'A server internal error has occurred')
        } )
    },

    decryptSubjects: (csvs) =>  {
        
        csvs.map(c => {
            if (c.decrypt === undefined || !c.decrypt) {
                let decData = CryptoJS.enc.Base64.parse(c.subject_name).toString(CryptoJS.enc.Utf8)
                c.subject_name = CryptoJS.AES.decrypt(decData, JSON.parse(localStorage.getItem('privateKey'))).toString(CryptoJS.enc.Utf8)
                c.decrypt = true
            }
            return c
        })

        return csvs
    },

    encryptSubjects: (csvs) => {
        csvs.map(c => {
            if (c.decrypt !== undefined && c.decrypt && c.subject_name !== '') {
                let encJson = CryptoJS.AES.encrypt(c.subject_name, JSON.parse(localStorage.getItem('privateKey')).toString())
                c.subject_name = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
                c.decrypt = false
            }
            return c
        })

        return csvs
    }


    



    
    

})


