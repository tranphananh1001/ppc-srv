<?php
// this file will do the SYNC job with Amazon

chdir("/srv/robots/");
require_once("AmazonAPI.php");
chdir("/srv/robots/src/MarketplaceWebService/Samples/");

include_once('.config.inc.php');

$results=true;
$err_messg='';

function invokeGetReportRequestList(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->getReportRequestList($request);

  //      echo ("Service Response\n");
   //     echo ("=============================================================================\n");

   //     echo ("        GetReportRequestListResponse\n");
        if ($response->isSetGetReportRequestListResult()) {
     //       echo ("            GetReportRequestListResult\n");
            $getReportRequestListResult = $response->getGetReportRequestListResult();
            if ($getReportRequestListResult->isSetNextToken()) {
      //          echo ("                NextToken\n");
      //          echo ("                    " . $getReportRequestListResult->getNextToken() . "\n");
            }
            if ($getReportRequestListResult->isSetHasNext()) {
      //          echo ("                HasNext\n");
      //          echo ("                    " . $getReportRequestListResult->getHasNext() . "\n");
            }
            $reportRequestInfoList = $getReportRequestListResult->getReportRequestInfoList();
            foreach ($reportRequestInfoList as $reportRequestInfo) {
    //            echo ("                ReportRequestInfo\n");
                if ($reportRequestInfo->isSetReportRequestId()) {
       //             echo ("                    ReportRequestId\n");
       //             echo ("                        " . $reportRequestInfo->getReportRequestId() . "\n");
                }
                if ($reportRequestInfo->isSetReportType()) {
           //         echo ("                    ReportType\n");
         //           echo ("                        " . $reportRequestInfo->getReportType() . "\n");
                }
                if ($reportRequestInfo->isSetStartDate()) {
           //         echo ("                    StartDate\n");
            //        echo ("                        " . $reportRequestInfo->getStartDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetEndDate()) {
           //         echo ("                    EndDate\n");
          //          echo ("                        " . $reportRequestInfo->getEndDate()->format(DATE_FORMAT) . "\n");
                }
                // add start
                if ($reportRequestInfo->isSetScheduled()) {
            //        echo ("                    Scheduled\n");
           //         echo ("                        " . $reportRequestInfo->getScheduled() . "\n");
                }
                // add end
                if ($reportRequestInfo->isSetSubmittedDate()) {
           //         echo ("                    SubmittedDate\n");
           //         echo ("                        " . $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetReportProcessingStatus()) {
            //        echo ("                    ReportProcessingStatus\n");
            //        echo ("                        " . $reportRequestInfo->getReportProcessingStatus() . "\n");
                }
                // add start
                if ($reportRequestInfo->isSetGeneratedReportId()) {
           //         echo ("                    GeneratedReportId\n");
           //         echo ("                        " . $reportRequestInfo->getGeneratedReportId() . "\n");
                }
                if ($reportRequestInfo->isSetStartedProcessingDate()) {
            //        echo ("                    StartedProcessingDate\n");
            //        echo ("                        " . $reportRequestInfo->getStartedProcessingDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetCompletedDate()) {
            //        echo ("                    CompletedDate\n");
           //         echo ("                        " . $reportRequestInfo->getCompletedDate()->format(DATE_FORMAT) . "\n");
                }
            }
        }
        if ($response->isSetResponseMetadata()) {
     //       echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
        //        echo ("                RequestId\n");
        //        echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }

      //  echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
    }
    catch (MarketplaceWebService_Exception $ex) {
   //     echo ("Caught Exception: " . $ex->getMessage() . "\n");
   //     echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
   //     echo ("Error Code: " . $ex->getErrorCode() . "\n");
   //     echo ("Error Type: " . $ex->getErrorType() . "\n");
   //     echo ("Request ID: " . $ex->getRequestId() . "\n");
   //     echo ("XML: " . $ex->getXML() . "\n");
   //     echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
       global $results, $err_messg;
        $results=false;
        $err_messg=$ex->getMessage();
    }
}


// read all data from users
$add_data='';
if ($argv[1]) $add_data=' and m.user='.$argv[1];

$grm1 = mysql_query("Select * from mws m, MWS_inernational i where m.country_id=i.country_id".$add_data);

while ($r1data = mysql_fetch_array($grm1)) {


$keyId       = $r1data["dev_access_key"];
$secretKey   = $r1data["dev_access_secret"];
$associateId = $r1data["marketplace_id"];
$serviceUrl=$r1data["dev_access_url"];

$marketplaceIdArray = array(
                                                                  "Id" => array(
                                                                      $r1data["marketplace_id"]
                                                                  )
                                                              );

$config = array(
    'ServiceURL' => $serviceUrl,
    'ProxyHost' => null,
    'ProxyPort' => -1,
    'MaxErrorRetry' => 3
);

$service = new MarketplaceWebService_Client($keyId, $secretKey, $config, APPLICATION_NAME, APPLICATION_VERSION);


    // check if we need to update requests
    // get all requests pending;

    $parameters = array(
        'Merchant' => $r1data["SellerID"],
        'MWSAuthToken' => $r1data["MWSAuthToken"] // Optional
    );
    $request    = new MarketplaceWebService_Model_GetReportRequestListRequest($parameters);
    invokeGetReportRequestList($service, $request);

echo "{ result: ".$results.", code: '".$err_messg."'}";

if (!$results) $grm3 = mysql_query("update mws set MWScheck='".$err_messg."' where user=".$argv[1]); else
 $grm3 = mysql_query("update mws set MWScheck=NULL where user=".$argv[1]);


}


?>