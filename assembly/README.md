## Install

### Deps
  - gcc
  
    ```
    sudo apt-get install build-essential
    ```
  
  - cmake
  
    ```
    sudo apt-get install cmake
    ```
  
  - Python
  
    ```
    sudo apt-get install python2.7
    ```
  
  - NodeJs
  
    ```
    sudo apt-get install nodejs
    ```
  
  - Java
  
    ```
    sudo apt-get install default-jre
    ```

Install Emscripten for Web Assembly

  - Download Emscripten - [link](https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk-portable.tar.gz)
  - Unzip the portable SDK package
  - Fetch the latest registry of available tools.
  
    ```
    ./emsdk update
    ```
    
  - Download and install the latest SDK tools. (In this case use "incoming" branch for Web Assembly)
  
    ```
    ./emsdk install sdk-incoming-64bit
    ```
    
  - Make the "latest" SDK "active". (In this case use "incoming" branch for Web Assembly)
  
    ```
    ./emsdk activate sdk-incoming-64bit
    ```
    
  - Set the current Emscripten path on Linux (or Mac OS X)
  
    ```
    source ./emsdk_env.sh
    cd emscripten/incoming
    ...
    ```
 ### Links => [link](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html#updating-the-emscripten-sdk) [link](https://github.com/kripken/emscripten/wiki/WebAssembly) [link](https://gist.github.com/kripken/59c67556dc03bb6d57052fedef1e61ab) [link](https://github.com/kripken/emscripten/issues/4453) [link](http://webassembly.org/getting-started/developers-guide/) [link](https://software.intel.com/ru-ru/articles/webassembly-an-initial-view)
