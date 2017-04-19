<?php
//pa
if( !function_exists('clearLog') ) {
    function clearLog ($folder=''){
        $files = glob($folder.'*'); // get all file names
		foreach($files as $file){ // iterate files
          if(is_file($file))
		    unlink($file); // delete file
		}
    }
}
// end pa

clearLog('/srv/robots/logs/get_skus_error/');

