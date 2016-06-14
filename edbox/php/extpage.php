<style>
	#target4{
		background: #fff;
		color: #666;
		padding:40px;
		text-align:justify;
		width: 600px;
	}
	#target4 h2{
		margin: 0 0 20px;
	}
	#target4 h2,
	#target4 .exPageLink{
		color: #333;
	}
</style>
<div id="target4">
	<h2>Hey! That's the example 4!</h2>
	<p>Parameter: <?php echo $_GET['parameter']; ?></p>
	<a class="exPagelink" href="#" onclick="$.edbox().closeBox();">close the box!</a>
</div>
