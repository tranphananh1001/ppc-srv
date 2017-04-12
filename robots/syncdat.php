<?php
// this file will do the SYNC job with Amazon

chdir("/srv/robots/");
require_once("AmazonAPI.php");
chdir("/srv/robots/src/MarketplaceWebService/Samples/");

include_once('.config.inc.php');

date_default_timezone_set("America/Los_Angeles");
writeLog('runSyncdat', 'syncdat runned', 'userid ' . $argv[1]);
function invokeRequestReport1(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->requestReport($request);
        
        echo ("Service Response\n");
        echo ("=============================================================================\n");
        
        echo ("        RequestReportResponse\n");
        if ($response->isSetRequestReportResult()) {
            echo ("            RequestReportResult\n");
            $requestReportResult = $response->getRequestReportResult();
            
            if ($requestReportResult->isSetReportRequestInfo()) {
                
                //save data to database;
                
                
                $reportRequestInfo = $requestReportResult->getReportRequestInfo();
                echo ("                ReportRequestInfo\n");
                if ($reportRequestInfo->isSetReportRequestId()) {
                    echo ("                    ReportRequestId\n");
                    echo ("                        " . $reportRequestInfo->getReportRequestId() . "\n");
                    $r_id = $reportRequestInfo->getReportRequestId();
                }
                if ($reportRequestInfo->isSetReportType()) {
                    echo ("                    ReportType\n");
                    echo ("                        " . $reportRequestInfo->getReportType() . "\n");
                }
                if ($reportRequestInfo->isSetStartDate()) {
                    echo ("                    StartDate\n");
                    echo ("                        " . $reportRequestInfo->getStartDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetEndDate()) {
                    echo ("                    EndDate\n");
                    echo ("                        " . $reportRequestInfo->getEndDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetSubmittedDate()) {
                    echo ("                    SubmittedDate\n");
                    echo ("                        " . $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetReportProcessingStatus()) {
                    echo ("                    ReportProcessingStatus\n");
                    echo ("                        " . $reportRequestInfo->getReportProcessingStatus() . "\n");
                    $r_date = $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT);
                }
                
                //save info into local dbase
                
                global $r1data;
                $r_date = date("Y-m-d H:i:s", strtotime($r_date));
                echo "insert into listing_reports_requests set user=" . $r1data["user"] . ", request_id='" . $r_id . "', request_date='" . $r_date . "'";
                @mysql_query("insert into listing_reports_requests set user=" . $r1data["user"] . ", request_id='" . $r_id . "', request_date='" . $r_date . "'");
                
                // echo("B1 -----ST");
                // var_dump($reportRequestInfo);
                // exit("B1-------END");
            }
        }
        if ($response->isSetResponseMetadata()) {
            echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
                echo ("                RequestId\n");
                echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }
        
        echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
    }
    catch (MarketplaceWebService_Exception $ex) {
        echo ("Caught Exception: " . $ex->getMessage() . "\n");
        echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
        echo ("Error Code: " . $ex->getErrorCode() . "\n");
        echo ("Error Type: " . $ex->getErrorType() . "\n");
        echo ("Request ID: " . $ex->getRequestId() . "\n");
        echo ("XML: " . $ex->getXML() . "\n");
        echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
    }
}

$requests_list = array();

function invokeGetReport1(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->getReport($request);
        
        echo ("Service Response\n");
        echo ("=============================================================================\n");
        
        echo ("        GetReportResponse\n");
        if ($response->isSetGetReportResult()) {
            $getReportResult = $response->getGetReportResult();
            echo ("            GetReport");
            
            if ($getReportResult->isSetContentMd5()) {
                echo ("                ContentMd5");
                echo ("                " . $getReportResult->getContentMd5() . "\n");
            }
        }
        if ($response->isSetResponseMetadata()) {
            echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
                echo ("                RequestId\n");
                echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }
        
        echo ("        Report Contents\n");
        //
        global $r1data;
        
        echo"B3333333333333333333333";
        $lines = explode("\n", stream_get_contents($request->getReport()));
        var_dump($lines);
        
        $head  = explode("\t", array_shift($lines));

        // var_dump($head);
        exit("ENDDDDD");

        $array = array();
        foreach ($lines as $line) {
            $array = explode("\t", $line);
            
            var_dump($array);
            
            //write data in sales report.
            
            //check if we have report for that SKU already
            
            $passthru = true;
            
            echo "Select * from listing_reports_data where user=" . $r1data["user"] . " and asin='" . $array[1] . "' and sku='" . $array[0] . "'";
            $grm = mysql_query("Select * from listing_reports_data where user=" . $r1data["user"] . " and asin='" . $array[1] . "' and sku='" . $array[0] . "'");
            
            
            while ($r_data = mysql_fetch_array($grm)) {
                
                //yes we have that line already
                
                $passthru = false;
                
            }
            
            //harvest all missing filelds
            
            global $amazonAPI, $keyId, $secretKey, $associateId;
            
            
            
            // Return XML data
            $amazonAPI = new AmazonAPI($keyId, $secretKey, $associateId);
            
            $amazonAPI->SetLocale('us');
            $amazonAPI->SetRetrieveAsArray();
            // Retrieve specific item by id
            $items = $amazonAPI->ItemLookUp($array[1]);
            var_dump($items);
            
            
            // record a new sale to report;
            
            
            if ($passthru) {
                
                global $reportId, $r1data;
                
                
                @mysql_query("insert into listing_reports_data set user=" . $r1data["user"] . ", sku='" . mysql_real_escape_string($array[0]) . "'," . " asin='" . mysql_real_escape_string($array[1]) . "', price='" . $array[2] . "', report_id='" . $reportId . "'");
                
            //    echo "insert into listing_reports_data set user=" . $r1data["user"] . ", `product-name`='" . mysql_real_escape_string($items[0]["title"]) . "', sku='" . mysql_real_escape_string($array[0]) . "'," . " asin='" . mysql_real_escape_string($array[1]) . "', url='" . mysql_real_escape_string($items[0]["url"]) . "', image_sm='" . mysql_real_escape_string($items[0]["smallImage"]) . "', " . " image_med='" . mysql_real_escape_string($items[0]["mediumImage"]) . "', image_big='" . mysql_real_escape_string($items[0]["largeImage"]) . "',  price='" . $array[2] . "', report_id='" . $reportId . "'";
                
            }
            
        }
        
        
        echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
        
        //write report status info;
        global $r1data;
        global $reportId;
        @mysql_query("insert into sales_reports_status where user=" . $r1data["user"] . ", report_date= NOW(), report_id='" . $reportId . "'");
        
        
    }
    catch (MarketplaceWebService_Exception $ex) {
        echo ("Caught Exception: " . $ex->getMessage() . "\n");
        echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
        echo ("Error Code: " . $ex->getErrorCode() . "\n");
        echo ("Error Type: " . $ex->getErrorType() . "\n");
        echo ("Request ID: " . $ex->getRequestId() . "\n");
        echo ("XML: " . $ex->getXML() . "\n");
        echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
    }
}

function invokeGetReportRequestList1(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->getReportRequestList($request);
        
        echo ("Service Response\n");
        echo ("=============================================================================\n");
        
        echo ("        GetReportRequestListResponse\n");
        if ($response->isSetGetReportRequestListResult()) {
            echo ("            GetReportRequestListResult\n");
            $getReportRequestListResult = $response->getGetReportRequestListResult();
            if ($getReportRequestListResult->isSetNextToken()) {
                echo ("                NextToken\n");
                echo ("                    " . $getReportRequestListResult->getNextToken() . "\n");
            }
            if ($getReportRequestListResult->isSetHasNext()) {
                echo ("                HasNext\n");
                echo ("                    " . $getReportRequestListResult->getHasNext() . "\n");
            }
            $reportRequestInfoList = $getReportRequestListResult->getReportRequestInfoList();
            foreach ($reportRequestInfoList as $reportRequestInfo) {
                echo ("                ReportRequestInfo\n");
                if ($reportRequestInfo->isSetReportRequestId()) {
                    echo ("                    ReportRequestId\n");
                    echo ("                        " . $reportRequestInfo->getReportRequestId() . "\n");
                }
                if ($reportRequestInfo->isSetReportType()) {
                    echo ("                    ReportType\n");
                    echo ("                        " . $reportRequestInfo->getReportType() . "\n");
                }
                if ($reportRequestInfo->isSetStartDate()) {
                    echo ("                    StartDate\n");
                    echo ("                        " . $reportRequestInfo->getStartDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetEndDate()) {
                    echo ("                    EndDate\n");
                    echo ("                        " . $reportRequestInfo->getEndDate()->format(DATE_FORMAT) . "\n");
                }
                // add start
                if ($reportRequestInfo->isSetScheduled()) {
                    echo ("                    Scheduled\n");
                    echo ("                        " . $reportRequestInfo->getScheduled() . "\n");
                }
                // add end
                if ($reportRequestInfo->isSetSubmittedDate()) {
                    echo ("                    SubmittedDate\n");
                    echo ("                        " . $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetReportProcessingStatus()) {
                    echo ("                    ReportProcessingStatus\n");
                    echo ("                        " . $reportRequestInfo->getReportProcessingStatus() . "\n");
                }
                // add start
                if ($reportRequestInfo->isSetGeneratedReportId()) {
                    echo ("                    GeneratedReportId\n");
                    echo ("                        " . $reportRequestInfo->getGeneratedReportId() . "\n");
                }
                if ($reportRequestInfo->isSetStartedProcessingDate()) {
                    echo ("                    StartedProcessingDate\n");
                    echo ("                        " . $reportRequestInfo->getStartedProcessingDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetCompletedDate()) {
                    echo ("                    CompletedDate\n");
                    echo ("                        " . $reportRequestInfo->getCompletedDate()->format(DATE_FORMAT) . "\n");
                }
                // add end
                
                
                // check if we need to download that report
                if ($reportRequestInfo->getReportProcessingStatus() === "_DONE_") {
                    
                    // check if we have that report in DB
                    global $r1data;
                    
                    $grm = mysql_query("Select * from listing_reports_requests where user=" . $r1data["user"] . " and request_id='" . $reportRequestInfo->getReportRequestId() . "'");
                    
                    // echo"B2---------ST";
                    // var_dump(mysql_fetch_array($grm));
                    // exit("B2----------END");

                    while ($r_data = mysql_fetch_array($grm)) {
                        
                        //yes. we found a request. add it to array
                        
                        global $requests_list;
                        
                        array_push($requests_list, $reportRequestInfo->getGeneratedReportId());
                        
                        // delete request from DB
                        @mysql_query("delete from listing_reports_requests where user=" . $r1data["user"] . " and request_id=" . $reportRequestInfo->getReportRequestId());
                        break;
                    }
                    
                }
            }
        }
        if ($response->isSetResponseMetadata()) {
            echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
                echo ("                RequestId\n");
                echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }
        
        echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
    }
    catch (MarketplaceWebService_Exception $ex) {
        echo ("Caught Exception: " . $ex->getMessage() . "\n");
        echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
        echo ("Error Code: " . $ex->getErrorCode() . "\n");
        echo ("Error Type: " . $ex->getErrorType() . "\n");
        echo ("Request ID: " . $ex->getRequestId() . "\n");
        echo ("XML: " . $ex->getXML() . "\n");
        echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
    }
}

function invokeGetReportRequestList(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->getReportRequestList($request);
        
        echo ("Service Response\n");
        echo ("=============================================================================\n");
        
        echo ("        GetReportRequestListResponse\n");
        if ($response->isSetGetReportRequestListResult()) {
            echo ("            GetReportRequestListResult\n");
            $getReportRequestListResult = $response->getGetReportRequestListResult();
            if ($getReportRequestListResult->isSetNextToken()) {
                echo ("                NextToken\n");
                echo ("                    " . $getReportRequestListResult->getNextToken() . "\n");
            }
            if ($getReportRequestListResult->isSetHasNext()) {
                echo ("                HasNext\n");
                echo ("                    " . $getReportRequestListResult->getHasNext() . "\n");
            }
            $reportRequestInfoList = $getReportRequestListResult->getReportRequestInfoList();
            foreach ($reportRequestInfoList as $reportRequestInfo) {
                echo ("                ReportRequestInfo\n");
                if ($reportRequestInfo->isSetReportRequestId()) {
                    echo ("                    ReportRequestId\n");
                    echo ("                        " . $reportRequestInfo->getReportRequestId() . "\n");
                }
                if ($reportRequestInfo->isSetReportType()) {
                    echo ("                    ReportType\n");
                    echo ("                        " . $reportRequestInfo->getReportType() . "\n");
                }
                if ($reportRequestInfo->isSetStartDate()) {
                    echo ("                    StartDate\n");
                    echo ("                        " . $reportRequestInfo->getStartDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetEndDate()) {
                    echo ("                    EndDate\n");
                    echo ("                        " . $reportRequestInfo->getEndDate()->format(DATE_FORMAT) . "\n");
                }
                // add start
                if ($reportRequestInfo->isSetScheduled()) {
                    echo ("                    Scheduled\n");
                    echo ("                        " . $reportRequestInfo->getScheduled() . "\n");
                }
                // add end
                if ($reportRequestInfo->isSetSubmittedDate()) {
                    echo ("                    SubmittedDate\n");
                    echo ("                        " . $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetReportProcessingStatus()) {
                    echo ("                    ReportProcessingStatus\n");
                    echo ("                        " . $reportRequestInfo->getReportProcessingStatus() . "\n");
                }
                // add start
                if ($reportRequestInfo->isSetGeneratedReportId()) {
                    echo ("                    GeneratedReportId\n");
                    echo ("                        " . $reportRequestInfo->getGeneratedReportId() . "\n");
                }
                if ($reportRequestInfo->isSetStartedProcessingDate()) {
                    echo ("                    StartedProcessingDate\n");
                    echo ("                        " . $reportRequestInfo->getStartedProcessingDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetCompletedDate()) {
                    echo ("                    CompletedDate\n");
                    echo ("                        " . $reportRequestInfo->getCompletedDate()->format(DATE_FORMAT) . "\n");
                }
                // add end
                
                
                // check if we need to download that report
                if ($reportRequestInfo->getReportProcessingStatus() === "_DONE_") {
                    
                    // check if we have that report in DB
                    global $r1data;
                    echo "Select * from sales_reports_requests where user=" . $r1data["user"] . " and request_id='" . $reportRequestInfo->getReportRequestId() . "'";
                    $grm = mysql_query("Select * from sales_reports_requests where user=" . $r1data["user"] . " and request_id='" . $reportRequestInfo->getReportRequestId() . "'");
                    
                    while ($r_data = mysql_fetch_array($grm)) {
                        
                        //yes. we found a request. add it to array
                        
                        global $requests_list;
                        
                        array_push($requests_list, $reportRequestInfo->getGeneratedReportId());
                        
                        // delete request from DB
                        @mysql_query("delete from sales_reports_requests where user=" . $r1data["user"] . " and request_id=" . $reportRequestInfo->getReportRequestId());
                        break;
                    }
                    
                }
            }
        }
        if ($response->isSetResponseMetadata()) {
            echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
                echo ("                RequestId\n");
                echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }
        
        echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
    }
    catch (MarketplaceWebService_Exception $ex) {
        echo ("Caught Exception: " . $ex->getMessage() . "\n");
        echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
        echo ("Error Code: " . $ex->getErrorCode() . "\n");
        echo ("Error Type: " . $ex->getErrorType() . "\n");
        echo ("Request ID: " . $ex->getRequestId() . "\n");
        echo ("XML: " . $ex->getXML() . "\n");
        echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
    }
}

function invokeRequestReport(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->requestReport($request);
        
        echo ("Service Response\n");
        echo ("=============================================================================\n");
        
        echo ("        RequestReportResponse\n");
        if ($response->isSetRequestReportResult()) {
            echo ("            RequestReportResult\n");
            $requestReportResult = $response->getRequestReportResult();
            
            if ($requestReportResult->isSetReportRequestInfo()) {
                
                //save data to database;
                
                
                $reportRequestInfo = $requestReportResult->getReportRequestInfo();
                echo ("                ReportRequestInfo\n");
                if ($reportRequestInfo->isSetReportRequestId()) {
                    echo ("                    ReportRequestId\n");
                    echo ("                        " . $reportRequestInfo->getReportRequestId() . "\n");
                    $r_id = $reportRequestInfo->getReportRequestId();
                }
                if ($reportRequestInfo->isSetReportType()) {
                    echo ("                    ReportType\n");
                    echo ("                        " . $reportRequestInfo->getReportType() . "\n");
                }
                if ($reportRequestInfo->isSetStartDate()) {
                    echo ("                    StartDate\n");
                    echo ("                        " . $reportRequestInfo->getStartDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetEndDate()) {
                    echo ("                    EndDate\n");
                    echo ("                        " . $reportRequestInfo->getEndDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetSubmittedDate()) {
                    echo ("                    SubmittedDate\n");
                    echo ("                        " . $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT) . "\n");
                }
                if ($reportRequestInfo->isSetReportProcessingStatus()) {
                    echo ("                    ReportProcessingStatus\n");
                    echo ("                        " . $reportRequestInfo->getReportProcessingStatus() . "\n");
                    $r_date = $reportRequestInfo->getSubmittedDate()->format(DATE_FORMAT);
                }
                
                //save info into local dbase
                
                global $r1data;
                $r_date = date("Y-m-d H:i:s", strtotime($r_date));
                echo "insert into sales_reports_requests set user=" . $r1data["user"] . ", request_id='" . $r_id . "', request_date='" . $r_date . "'";
                @mysql_query("insert into sales_reports_requests set user=" . $r1data["user"] . ", request_id='" . $r_id . "', request_date='" . $r_date . "'");
            }
        }
        if ($response->isSetResponseMetadata()) {
            echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
                echo ("                RequestId\n");
                echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }
        
        echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
    }
    catch (MarketplaceWebService_Exception $ex) {
        echo ("Caught Exception: " . $ex->getMessage() . "\n");
        echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
        echo ("Error Code: " . $ex->getErrorCode() . "\n");
        echo ("Error Type: " . $ex->getErrorType() . "\n");
        echo ("Request ID: " . $ex->getRequestId() . "\n");
        echo ("XML: " . $ex->getXML() . "\n");
        echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
    }
}

function invokeGetReport(MarketplaceWebService_Interface $service, $request)
{
    try {
        $response = $service->getReport($request);
        
        echo ("Service Response\n");
        echo ("=============================================================================\n");
        
        echo ("        GetReportResponse\n");
        if ($response->isSetGetReportResult()) {
            $getReportResult = $response->getGetReportResult();
            echo ("            GetReport");
            
            if ($getReportResult->isSetContentMd5()) {
                echo ("                ContentMd5");
                echo ("                " . $getReportResult->getContentMd5() . "\n");
            }
        }
        if ($response->isSetResponseMetadata()) {
            echo ("            ResponseMetadata\n");
            $responseMetadata = $response->getResponseMetadata();
            if ($responseMetadata->isSetRequestId()) {
                echo ("                RequestId\n");
                echo ("                    " . $responseMetadata->getRequestId() . "\n");
            }
        }
        
        echo ("        Report Contents\n");
        //
        global $r1data;
        $lines = explode("\n", stream_get_contents($request->getReport()));
        $head  = explode("\t", array_shift($lines));
        
        $array = array();
        foreach ($lines as $line) {
            $array = explode("\t", $line);
            
            //write data in sales report.
            
            //check if we have report for that SKU already
            
            $passthru = true;
            echo "Select * from sales_reports_data where user=" . $r1data["user"] . " and asin='" . $array[12] . "' and `amazon-order-id`='" . $array[0] . "'";
            $grm = mysql_query("Select * from sales_reports_data where user=" . $r1data["user"] . " and asin='" . $array[12] . "' and `amazon-order-id`='" . $array[0] . "'");
            
            
            while ($r_data = mysql_fetch_array($grm)) {
                
                //yes we have that line already
                
                $passthru = false;
                
            }
            
            // record a new sale to report;
            
            echo "SHIPPED!!!" . $array[13];
            
            
            if (($array[13] === "Shipped") && $passthru) {
                
                global $reportId;
                global $r1data;
                
                $array[2] = date("Y-m-d H:i:s", strtotime($array[2]));
                
                echo "insert into sales_reports_data set user=" . $r1data["user"] . ", `amazon-order-id`='" . $array[0] . "', `purchase-date`='" . $array[2] . "'," . "`product-name`='" . mysql_real_escape_string($array[10]) . "', sku='" . mysql_real_escape_string($array[11]) . "', asin='" . $array[12] . "', quantity=" . $array[14] . ", " . "currency='" . $array[15] . "', `item-price`='" . $array[16] . "', report_id='" . $reportId . "'";
                
                @mysql_query("insert into sales_reports_data set user=" . $r1data["user"] . ", `amazon-order-id`='" . $array[0] . "', `purchase-date`='" . $array[2] . "'," . "`product-name`='" . mysql_real_escape_string($array[10]) . "', sku='" . mysql_real_escape_string($array[11]) . "', asin='" . $array[12] . "', quantity=" . $array[14] . ", " . "currency='" . $array[15] . "', `item-price`='" . $array[16] . "', report_id='" . $reportId . "'");
                
                
            }
            
        }
        
        
        echo ("            ResponseHeaderMetadata: " . $response->getResponseHeaderMetadata() . "\n");
        
        //write report status info;
        global $r1data;
        global $reportId;
        @mysql_query("insert into sales_reports_status where user=" . $r1data["user"] . ", report_date= NOW(), report_id='" . $reportId . "'");
        
        
    }
    catch (MarketplaceWebService_Exception $ex) {
        echo ("Caught Exception: " . $ex->getMessage() . "\n");
        echo ("Response Status Code: " . $ex->getStatusCode() . "\n");
        echo ("Error Code: " . $ex->getErrorCode() . "\n");
        echo ("Error Type: " . $ex->getErrorType() . "\n");
        echo ("Request ID: " . $ex->getRequestId() . "\n");
        echo ("XML: " . $ex->getXML() . "\n");
        echo ("ResponseHeaderMetadata: " . $ex->getResponseHeaderMetadata() . "\n");
    }
}

/*
$keyId       = 'AKIAJJOK44FTSBER42WA';
$secretKey   = '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';
$associateId = 'A1IHSU86H5ZFDO';
*/

// read all data from users
$add_data='';
if ($argv[1]) $add_data=' and m.user='.$argv[1];

$grm1 = mysql_query("Select * from mws m, MWS_inernational i where m.country_id=i.country_id".$add_data);

echo "Select * from mws m, MWS_inernational i where m.country_id=i.country_id".$add_data;

while ($r1data = mysql_fetch_array($grm1)) {

echo "lalallaallalalaalla1111";

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

/*   
    // check if we need to update requests
    // get all requests pending;
   
    $parameters = array(
        'Merchant' => $r1data["SellerID"],
        'MWSAuthToken' => $r1data["MWSAuthToken"] // Optional
    );
    $request    = new MarketplaceWebService_Model_GetReportRequestListRequest($parameters);
   // invokeGetReportRequestList($service, $request);
    // now we have a list with reports to upload. lets do it
    
    foreach ($requests_list as $reportId) {
        
        $parameters = array(
            'Merchant' => $r1data["SellerID"],
            'MWSAuthToken' => $r1data["MWSAuthToken"],
            "Report" => @fopen("php://memory", "rw+"),
            "ReportId" => $reportId
        );
        $request    = new MarketplaceWebService_Model_GetReportRequest($parameters);
        
        
        
    //    invokeGetReport($service, $request);
        
        
    }
    
    // check if we created a request already if not then create it
    
    
	echo "Select * from sales_reports_status where user=" . $r1data["user"] . " and report_date > DATE_SUB(NOW(), INTERVAL 1 DAY) order by report_date DESC LIMIT 1";
	
	
    $grm = mysql_query("Select * from sales_reports_status where user=" . $r1data["user"] . " and report_date > DATE_SUB(NOW(), INTERVAL 1 DAY) order by report_date DESC LIMIT 1");
    
    if (mysql_num_rows($grm) > 0)
		
		{$new_request = false;
		
		echo "FALSE!!!!!!!!!!!!!!!"; 
		
		}
        
    else {
        
		echo "TRUE!!!!!!!!!!!!!!!"; 
        //check the last date of report
        $new_request = true;
        
        $grm = mysql_query("Select * from sales_reports_status where user=" . $r1data["user"] . " and report_date > DATE_SUB(NOW(), INTERVAL 30 DAY) order by report_date DESC LIMIT 1");
        
        if (mysql_num_rows($grm) > 0) {
            
            $nd = mysql_fetch_array($grm);
            
            $datetime1 = new DateTime('now');
            $datetime2 = new DateTime($nd['report_date']);
            $interval  = $datetime1->diff($datetime2);
            $enddate   = $interval->format('%R%a');
            
            
        } else
            $enddate = "30";
        
    }
    
    //creating a new request
    
    if ($new_request) {
        
        
        $d  = new DateTime("now");
        $sd = new DateTime("now");
        $d->modify("-" . $enddate . " days");
        
        
        
        $parameters = array(
            'Merchant' => $r1data["SellerID"],
            'MWSAuthToken' => $r1data["MWSAuthToken"],
            'MarketplaceIdList' => $marketplaceIdArray,
            'ReportType' => '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_',
            'ReportOptions' => 'ShowSalesChannel=true',
            'StartDate' => $d,
            'EndDate' => $sd
        );
        
        $request = new MarketplaceWebService_Model_RequestReportRequest($parameters);
        
     //   invokeRequestReport($service, $request);
        
    }
    
  */  
    
    // check if some SKU needs to be updated (we need info for them)
    
    
    //get inventory first
    
    
    
    // check if we created a request already if not then create it

    //
 //   $grm99 = mysql_query('UPDATE listing_reports_data,mws,subscriptions,tariffs SET listing_reports_data.allowed=1 WHERE mws.subscription_id=subscriptions.id AND // subscriptions.plan_id=tariffs.name AND tariffs.max_sku=0 AND listing_reports_data.user=mws.user');
    
   //print_r($service);
   echo "lalallala"; 
    
    
    $grm = mysql_query("Select * from listing_reports_status where user=" . $r1data["user"] . " and report_date > DATE_SUB(NOW(), INTERVAL 1 DAY) order by report_date DESC LIMIT 1");
    
    if (mysql_num_rows($grm) > 0)
        $new_request = false;
    else {
        
        //check the last date of report
        $new_request = true;
        
        $grm = mysql_query("Select * from listing_reports_status where user=" . $r1data["user"] . " and report_date > DATE_SUB(NOW(), INTERVAL 30 DAY) order by report_date DESC LIMIT 1");
        
        if (mysql_num_rows($grm) > 0) {
            
            $nd = mysql_fetch_array($grm);
            
            $datetime1 = new DateTime('now');
            $datetime2 = new DateTime($nd['report_date']);
            $interval  = $datetime1->diff($datetime2);
            $enddate   = $interval->format('%R%a');
            
            
        } else
            $enddate = "30";
        
    }
    
    
    
    //creating a new request
    
    if ($new_request) {
        
        
        $d  = new DateTime("now");
        $sd = new DateTime("now");
        $d->modify("-60 months");
        
        
        $parameters = array(
            'Merchant' => $r1data["SellerID"],
            'MWSAuthToken' => $r1data["MWSAuthToken"],
            'MarketplaceIdList' => $marketplaceIdArray,
            'ReportType' => '_GET_FLAT_FILE_OPEN_LISTINGS_DATA_',
            //  'ReportOptions' => 'ShowSalesChannel=true',
            'StartDate' => $d,
            'EndDate' => $sd
        );
        
        echo '===PARAMETER==';
        print_r($parameters);
        $request = new MarketplaceWebService_Model_RequestReportRequest($parameters);
        
        invokeRequestReport1($service, $request);
        
    }
    //
    
    $requests_list = array();
    
    
    // check if we need to update requests
    
    // get all requests pending;
    
    
    $parameters = array(
        'Merchant' => $r1data["SellerID"],
        'MWSAuthToken' => $r1data["MWSAuthToken"]
    );
    echo "\n=====at here=====at here";
    $request    = new MarketplaceWebService_Model_GetReportRequestListRequest($parameters);
    
    
    
    invokeGetReportRequestList1($service, $request);
    
    // now we have a list with reports to upload. lets do it
    
    foreach ($requests_list as $reportId) {
        
        
        $parameters = array(
            'Merchant' => $r1data["SellerID"],
            'MWSAuthToken' => $r1data["MWSAuthToken"],
            "Report" => @fopen("php://memory", "rw+"),
            "ReportId" => $reportId
        );
        $request    = new MarketplaceWebService_Model_GetReportRequest($parameters);
        
       
        
        invokeGetReport1($service, $request);
        
       
    }
    writeLog('syncdatCompleted', 'syncdat completed', 'user ' . $argv[1]);
}

function writeLog ($script='SCRIPT', $msg='', $fileSuffix='', $newFile=false){
     
    $filename = __DIR__ . '/logs/'.$script.'_'.$fileSuffix.'.log';
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

?>
