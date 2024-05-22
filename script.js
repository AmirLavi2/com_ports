let boardsNickname = {};

const refreshButton = document.getElementById('refresh');
const comPortsSelect = document.getElementById('comPorts');
const runScriptButton = document.getElementById('runScript');
const batchScriptInput = document.getElementById('batchScript');

const comList = document.getElementById('comList');

const getConfig = async (sn) => {
    const response = await window.electronAPI.saveConfig('a');
    if (response.success) {
        console.log('Success:', response.message);
        boardsNickname = response.message;
        boardsNickname = JSON.parse(boardsNickname)
    } else {
        console.error('Error:', response.message);
    }
}
getConfig();

refreshButton.addEventListener('click', async () => {
    getConfig();
    const ports = await window.electronAPI.listPorts();
    comPortsSelect.innerHTML = '';
    comList.innerHTML = '';
    ports.forEach(port => {
        console.log('forEach port:', port);
        const option = document.createElement('option');
        option.value = port.path;
        option.textContent = 'friendlyName:' + port.friendlyName + ' | serialNumber:' + port.serialNumber + ' path:' + port.path;
        comPortsSelect.appendChild(option);

        const comSN = document.createElement('span');
        comSN.innerHTML = 's/n: ' + port.serialNumber;
        comList.appendChild(comSN);

        const comPort = document.createElement('span');
        comPort.innerHTML = ' | port: ' + port.path;
        comList.appendChild(comPort);

        const deviceNameText = document.createElement('span');
        deviceNameText.innerHTML = ' | nickname: ';
        comList.appendChild(deviceNameText);

        const comName = document.createElement('input');
        comName.setAttribute('type', 'text');
        comName.setAttribute('id', port.serialNumber);

        console.log('boardsNickname:', boardsNickname);
        

        console.log('boardsNickname:', boardsNickname);
        console.log('port.serialNumber:', port.serialNumber);
        let nickId = port.serialNumber;
        console.log('boardsNickname[port.serialNumber]:', boardsNickname["5&77B4171&0&3"]);

        comName.setAttribute('value', boardsNickname[port.serialNumber]); 
        comList.appendChild(comName);
    });
});

runScriptButton.addEventListener('click', async () => {
    const scriptPath = batchScriptInput.files[0].path;
    try {
        const batchRes = await window.electronAPI.runScript(scriptPath);
        const outputPre = document.getElementById('output');
        outputPre.textContent = batchRes;
    } catch (error) {
        console.log('runScriptButton -> scriptPath:', scriptPath);
        console.log('runScriptButton -> batchRes:', batchRes);
        outputPre.textContent = `Error: ${error}`;
    }
});