var current = "page1";

function changePage(newPage)
{
	document.getElementById(current).style.display="none";
	document.getElementById(newPage).style.display="block";
	current = newPage;
}