/**
 * Namespace
 */
var Terminal = Terminal || {};
var Command  = Command  || {};

// Note: The file system has been prefixed as of Google Chrome 12:
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

/**
 * FilesystemErrorHandler
 */
Terminal.FilesystemErrorHandler = function(event) {
    
    // Case
    var msg = '';
    switch (event.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    }

    // Log
    console.log('Filesystem Error: ' + msg);
};

/**
 * Terminal Events
 */
Terminal.Events = function(inputElement, OutputElement) {
    
    // Set Root Pointer
    window.requestFileSystem(window.TEMPORARY, 1024*1024, function(fs) {Terminal.Filesystem.pwd = fs.root}, Terminal.FilesystemErrorHandler);
    
    // Sets
    var input = document.getElementById(inputElement);
    var body  = document.getElementById('body');
      
    // Input Keypress
    input.onkeydown = function(event) {
        if (event.which == 13 || event.keyCode == 13) {
            
            // Input Value
            var inputValue = input.value;
            var output     = new Terminal.Output(OutputElement);
            
            // Check Command Empty
            if (inputValue == '') {
                return false;
            }
            
            // Command
            var inputParse = inputValue.split(' ');
            var command    = inputParse[0].toLowerCase();
            
            // Get Command
            var commandInstance = Command.Factory.create(command);
            var fsCallback      = commandInstance.getFsCallback(inputParse, output);

            // Execute FileSystem Function
            if (!(fsCallback instanceof Terminal.Output)) {
                window.requestFileSystem(window.TEMPORARY, 1024*1024, fsCallback, Terminal.FilesystemErrorHandler);
            }
            
            // Clear Input
            input.value = '';
        }
        return true;
    };
    
    // Click Body
    body.onclick = function() {
        input.focus();
    };
};

/**
 * Output
 */
Terminal.Output = function(element) {
    
    // OutputElemen
    var outputElement = document.getElementById(element);
    
    // White
    this.write = function(content) {
        var fromContent = outputElement.innerHTML;
        fromContent += '<div class="cmd-output">';
        fromContent += content;
        fromContent += '</div>';
        outputElement.innerHTML = fromContent;
        return this;
    };
    
    this.clear = function() {
        outputElement.innerHTML = '';
        return this;
    };
};

/**
 * Terminal Filesystem Pointer
 */
Terminal.Filesystem = {
    pwd: null
};

/**
 * Command Help
 */
Command.Help = {
    getFsCallback: function(input, output) {
        var helpContent = '';
        helpContent += '<strong>HELP MENU:</strong>'
        helpContent += '<div><strong>clear&nbsp;&nbsp;</strong>&nbsp;                  | Clear terminal screen</div>';
        helpContent += '<div><strong>help&nbsp;&nbsp;&nbsp;</strong>&nbsp;            | Display a list of system commands</div>';
        helpContent += '<div><strong>version</strong>&nbsp;                          | Show the version</div>';
        helpContent += '<br><div class="highlight">ELIZA is a computer program and an early example of primitive natural language processing.<br>This is just an alpha version,and I will appreciate it if you could help me finish this project.</div><div>Type "github" to view this project on Github!</div><br>'
        return output.write(helpContent);
    }
};

/**
 * Command Clear
 */
Command.Clear={
    getFsCallback:function(input, output){
        return output.clear();
    }
};
/**
 * Command Version
 */
Command.Version={
    getFsCallback:function(input,output){
        return output.write('alpha 0.1 build131219_001');
    }
};

/**
 * Command Github
 */
Command.Github={
    getFsCallback:function(input,output){
        window.open('https://github.com/Jing0/Web-ELIZA');
        return output.write('Done!Thanks if you can help me!');
    }
};
/**
 * Command Not Found
 */
Command.Notfound={
    getFsCallback:function(input, output){
        return output.write('Sorry,I don&acute;t understand');
    }
};
/**
 * Terminal CommandFactory
 */
Command.Factory={
    commandMap : {
      'clear' : Command.Clear,
      'help'  : Command.Help,
      'version':Command.Version,
      'github': Command.Github,
    },
  
    create: function(option) {
        if (this.commandMap[option] != null) {
            return this.commandMap[option];
        }      
        return Command.Notfound;        
    }
};

/**
 * Window Load
 */
window.onload = function() {
    new Terminal.Events('cmdline', 'output');
};
