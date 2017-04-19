<?php
//pa
if( !function_exists('writeLogSku') ) {
    function writeLogSku ($msg='', $fileSuffix='', $newFile=false){
        $script = 'log';
        
        $folder = __DIR__ . '/logs/test_log/';
        
        if ( !file_exists($folder) ) {
            mkdir($folder);
        }

        $filename = $folder.$script.'_'.$fileSuffix.'.log';
        if (!file_exists($filename)) {
            $fh = fopen($filename, 'w') or die("Can't create file");
        }
        if (is_writable($filename)) {
            if($newFile){
                $fp = fopen($filename, "w");
            }else{
                $fp = fopen($filename, "a");
            }
            $data = date("Y-m-d H:i:s")."\t".$msg."\n";
                if (!$write = fwrite($fp, $data)) {
                    echo "\033[31m Не могу произвести запись в файл ($filename) \033[0m  \n";
                }
            fclose($fp);
        }else{
            echo "\033[31m Log file not writable \033[0m  \n";  
        }
    }
}
// end pa

writeLogSku( date('d-m-Y H:i', time()).' clear', time());


