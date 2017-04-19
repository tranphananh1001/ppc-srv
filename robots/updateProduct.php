<?php
chdir("/srv/robots/");
      $link = mysql_connect('127.0.0.1', 'root', '');
   if (!$link) {
       die('Could not connect: ' . mysql_error());
   }

    mysql_select_db('test', $link) or die('Could not select database.');



require_once "vendor/autoload.php";

use ApaiIO\Operations\Lookup;
use ApaiIO\Configuration\GenericConfiguration;
use ApaiIO\ApaiIO;

//pa
if( !function_exists('writeLogSku') ) {
    function writeLogSku ($msg='', $fileSuffix='', $newFile=false){
        $script = 'insert_listing_reports_data_image_productname';
        
        $folder = __DIR__ . '/logs/get_skus_error/';
        
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

$conf = new GenericConfiguration();
$client = new \GuzzleHttp\Client(['http_errors' => false]);
$request = new \ApaiIO\Request\GuzzleRequest($client);







	// AWS endpoint for each locale
	$m11 = array(
		'ca'	=>	'ca',
		'cn'	=>	'cn',
		'de'	=>	'de',
		'es'	=>	'es',
		'fr'	=>	'fr',
		'it'	=>	'it',
		'jp'	=>	'co.jp',
		'gb'	=>	'co.uk',
		'us'	=>	'com',
	);


$add_data='';
if ($argv[1]) $add_data=' where user='.$argv[1]. ' and ( `product-name`="" or image_sm="" or image_med="" or image_big="") ';

echo "Select * from listing_reports_data".$add_data;
$grm = mysql_query("Select * from listing_reports_data".$add_data);


while ($r11 = mysql_fetch_array($grm)) {
    sleep (1);
    // echo "Select * from users u, product_advertising_keys p, mws m where m.user=u.id and u.id=".$r11["user"]." and m.country_id=p.contry_code";
        $grm1 = mysql_query("Select * from user u, product_advertising_keys p, mws m where m.user=u.id and u.id=".$r11["user"]." and m.country_id=p.country_code");
    	$r12 = mysql_fetch_array($grm1);
		//if ($r11["country_id"]!=='us') continue;
		$conf
        ->setCountry($m11[$r12["country_id"]])
        ->setAccessKey($r12["key"])
        ->setSecretKey($r12["secret"])
        ->setAssociateTag($r12["associate"])
        ->setRequest($request);

     //   echo(conf);

    $apaiIo = new ApaiIO($conf);


    			$lookup = new Lookup();
    $lookup->setItemId($r11["asin"]);
    $lookup->setResponseGroup(array('Large', 'Images')); // More detailed information

    do {

        $response = $apaiIo->runOperation($lookup);
        $xml = simplexml_load_string($response);

        sleep(2);

    } while (isset($xml->Error) || property_exists($xml, 'Error'));

    $product=((string)$xml->Items->Item->ItemAttributes->Title);
    // echo $r11["user"].' - ' .$r11["asin"].' - ' .$product. "\n";
    $image_sm=((string)$xml->Items->Item->SmallImage->URL);
    // echo $r11["user"].' - ' .$r11["asin"].' - '.$image_sm. "\n";
    $image_med=((string)$xml->Items->Item->MediumImage->URL);
    // echo $r11["user"].' - ' .$r11["asin"].' - ' .$image_med. "\n";
    $image_big=((string)$xml->Items->Item->LargeImage->URL);
    // echo $r11["user"].' - ' .$r11["asin"].' - '.$image_big. "\n";

    $data_log = [
    	'asin' => $r11["asin"],
    	'product' => $product,
    	'image_sm' => $image_sm,
    	'image_med' => $image_med,
    	'image_big' => $image_big
    ];
    if ( empty($product) || empty($image_sm) || empty($image_med) || empty($image_big) ) {
    	writeLogSku(json_encode($data_log), $r11["user"]);
    }


    @mysql_query("update listing_reports_data set `product-name`='" . mysql_real_escape_string($product) . "', image_sm='" . mysql_real_escape_string($image_sm) . "', " . " image_med='" . mysql_real_escape_string($image_med) . "', image_big='" . mysql_real_escape_string($image_big) . "' where asin='".$r11["asin"]."' and user=".$r12["user"]);


}

?>