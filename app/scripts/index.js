// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

import AxvecoLogo from "../assets/axveco.jpg"

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import fileHashArtifact from '../../build/contracts/FileHash.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
const FileHashContract = contract(fileHashArtifact)

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
let accounts
let account

function hexDigest(buffer) {
  var digest = ''
  var view = new DataView(buffer)
  for(var i = 0; i < view.byteLength; i += 4) {
    var value = view.getUint32(i)
    var stringValue = value.toString(16)
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    digest += paddedValue
  }

  return digest
}

const App = {
  start: function () {
    // Bootstrap the MetaCoin abstraction for Use.
    FileHashContract.setProvider(web3.currentProvider)

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      App.accounts = accs;
      App.account = App.accounts[0];
      document.getElementById("address").innerHTML = App.account;
    })
  },

  setUploadStatus: function (message) {
    const status = document.getElementById('uploadStatus')
    status.innerHTML = message
  },
  setCheckStatus: function (message) {
    const status = document.getElementById('checkStatus')
    status.innerHTML = message
  },

  getFileHash: function(file, callback) {
    var fr = new FileReader();
    var digest;
    fr.onload = function(event) {
      var bytes = new Uint8Array(event.target.result);
      crypto.subtle.digest("SHA-256", bytes ).then(function (hash) {
        callback(hash);
      });
    }
    fr.readAsArrayBuffer(file);

  },

  uploadFile: function() {
    var file = document.getElementById("upload").files[0];
    if (!file) {
      this.setUploadStatus("You didn't select any files.");
      return;
    }
    this.getFileHash(file, function (hash) {
      var instance;
      FileHashContract.deployed().then(inst => {
        instance = inst;
        return instance.addHash.estimateGas(hexDigest(hash), {from: App.account});
      }).then(_gas => {
        return instance.addHash(hexDigest(hash), {
          from: App.account,
          gas: _gas
        });
      }).then(() => {
        App.setUploadStatus("File uploaded.");
      })
      .catch(err => {
        App.setUploadStatus("Error uploading file (see dev console).");
        console.error(err);
      });
    });
  },

  checkFile: function() {
    var file = document.getElementById("check").files[0];
    if (!file) {
      App.setCheckStatus("You didn't select any files.");
      return;
    }
    this.getFileHash(file, function (hash) {
      FileHashContract.deployed().then(instance => {
        return instance.hashRegistry(App.account, hexDigest(hash));
      }).then(result => {
        if (result) {
          App.setCheckStatus("This file hash already exists in the blockchain.");
        } else {
          App.setCheckStatus("This file doesn't yet exist in the blockchain.");
        }
      }).catch(err => {
        App.setCheckStatus("Error retrieving information from the blockchain (see dev console).")
        console.error(err);
      })
    });
  },
  // instance.hashRegistry(account).then(hashMapping => {
  //   console.log(hashMapping);
  //   // hashMapping.call(hash, {from: App.account}).then(exists => {
  //   //   if (exists) {
  //   //     App.setCheckStatus("This file hash already exists in the blockchain.");
  //   //   } else {
  //   //     App.setCheckStatus("This file doesn't yet exist in the blockchain.");
  //   //   }
  //   // })
  // })

  refreshBalance: function () {
    let meta
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setUploadStatus('Error getting balance; see log.')
    })
  },
}

window.App = App

window.addEventListener('load', function () {
  var axvecoImage = new Image();
  axvecoImage.src = AxvecoLogo;
  console.log(AxvecoLogo);
  document.getElementById("imgContainer").appendChild(axvecoImage);

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:8545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  App.start()
})
