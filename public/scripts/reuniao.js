const ELEMENT_ID = 'clube-reuniao'
const DOMAIN = 'meet.jit.si'
const FULL_SIZE = '100%'
const parentNode = document.getElementById(ELEMENT_ID)
const { roomName, clubeName } = parentNode.dataset

// eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
const jitsiApi = new JitsiMeetExternalAPI(DOMAIN, {
    roomName: roomName,
    width: FULL_SIZE,
    height: FULL_SIZE,
    parentNode: parentNode,
    onload: () => jitsiApi.executeCommand('localSubject', clubeName)
 
})

jitsiApi.executeCommand('localSubject', clubeName)
