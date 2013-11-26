<?php
/* Doge server! Wow! */

// List of cool doge words!
$doge_words = ["wow", "so cool", "amaze", "so yum", "so loyal", "such delicious", "such wow", "such frendship", "much fun", "much cake", "much awesum", "best frend"];

$filename = "topscores.json"; // Doge tip: database should be used instead of a file!
$topScoreCount = 10; // Max count of top scores

if(isset($_POST['submit_score'])) {
    // Parse new score
    $data = json_decode($_POST['submit_score']);
    if ($data != null && $data->{'player'} != null && $data->{'score'} != null && is_int($data->{'score'})) {
        $current = [date('d.m.Y H:i'), substr(trim($data->{'player'}), 0, 15), $data->{'score'}];
        
        // Read old scores
        $contents = json_decode(file_get_contents($filename), true);
        
        if (empty($contents)) {
            // No scores yet
            $contents = [$current];
        } else {
            array_push($contents, $current);
        }
        // Sort the scores
        usort($contents, 'cmp');
        if (count($contents) > $topScoreCount) {
            array_pop($contents);
        }
        
        // Encode to JSON
        $json_contents = json_encode($contents);
        
        // Save new top scores
        $fhandle = fopen($filename, "w");
        fwrite($fhandle, $json_contents);
        fclose($fhandle);
        
        // Send results
        echo $json_contents;
    }
} else {
    // Shuffle the word order
    shuffle($doge_words);

    // Send as JSON encoded
    echo json_encode($doge_words);
}

// Comparition function for sorting the top scores
function cmp(array $a, array $b) {
    if ($a[2] > $b[2]) {
        return -1;
    } else if ($a[2] < $b[2]) {
        return 1;
    } else {
        return 0;
    }
}

?>