window.submissions = [];

jQuery(document).ready( function() {
	if (window.isLoggedIn) {
		jQuery('#tabs').tabs();
		init();
	}
});

function init() {

	getAllSubmissions( function(entries) {
		initDataGrid(entries);
	});

	jQuery('#searchText').keyup( function() {
		var text = jQuery(this).val();
		var matches = filterSubmissions(text);
		refreshGridUI(matches);
	});
	
	initConfigureTab();
}

function getAdminConfig(callback) {
  var ajaxCall = {};
  ajaxCall.type = 'GET';
  ajaxCall.url = '/GetAdminConfig';
  ajaxCall.dataType = 'json'; // expecting back
  ajaxCall.processData = false;
  ajaxCall.error = function(xhr, text, error) {
    console.log('Get admin config incurred an error: ' + xhr.statusText);
  };
  ajaxCall.success = function(res) {
    clearConfigureStatus();
    callback(res);
  };
  showConfigureStatus("loading ...");
  jQuery.ajax(ajaxCall);     
  
}

function persistAdminConfig() {
  var developerKey = jQuery('#developerKey').val();   
  var clientId = jQuery('#clientId').val();
  var youTubeUsername = jQuery('#youTubeUsername').val();
  var youTubePassword = jQuery('#youTubePassword').val();
  var defaultTag = jQuery('#defaultTag').val();
  var moderationMode = jQuery('#moderationMode').val();
  var brandingMode = jQuery('#brandingMode').val();
  var submissionMode = jQuery('#submissionMode').val();
  var loginInstruction = escape(jQuery('#loginInstruction').val());
  
  var jsonObj = {};
  jsonObj.developerKey = developerKey;
  jsonObj.clientId = clientId;
  jsonObj.youTubeUsername = youTubeUsername;
  jsonObj.youTubePassword = youTubePassword;
  jsonObj.defaultTag = defaultTag;
  jsonObj.moderationMode = moderationMode;
  jsonObj.brandingMode = brandingMode;  
  jsonObj.submissionMode = submissionMode;  
  jsonObj.loginInstruction = loginInstruction;
  
  var ajaxCall = {};
  ajaxCall.type = 'POST';
  ajaxCall.url = '/PersistAdminConfig';
  ajaxCall.data = JSON.stringify(jsonObj);
  ajaxCall.dataType = 'json'; // expecting back
  ajaxCall.processData = false;
  ajaxCall.error = function(xhr, text, error) {
    showConfigureStatus('Persist admin config incurred an error: ' + xhr.statusText);
  };
  ajaxCall.success = function(res) {
    showConfigureStatus('saved!');
  };
  showConfigureStatus('saving ...');
  jQuery.ajax(ajaxCall);    
}

function initConfigureTab() {
  var saveButton = jQuery('#saveButton');     
  
  getAdminConfig(function(adminConfig) {
    jQuery('#developerKey').val(adminConfig.developerKey);
    jQuery('#clientId').val(adminConfig.clientId);
    jQuery('#youTubeUsername').val(adminConfig.youTubeUsername);
    jQuery('#youTubePassword').val(adminConfig.youTubePassword);
    jQuery('#defaultTag').val(adminConfig.defaultTag);
    jQuery('#moderationMode').val(adminConfig.moderationMode);
    jQuery('#brandingMode').val(adminConfig.brandingMode);
    jQuery('#brandingMode').val(adminConfig.brandingMode);
    jQuery('#loginInstruction').val(unescape(adminConfig.loginInstruction));  
  });
  
  saveButton.click(function() {
    persistAdminConfig();
  });
}

function filterSubmissions(text) {

	var ret = [];

	var regex = new RegExp(text, 'i');

	for ( var i = 0; i < window.submissions.length; i++) {
		var entry = window.submissions[i];

		var title = entry.videoTitle;
		var description = entry.videoDescription;
		var tags = entry.videoTags;

		if (regex.test(title) || regex.test(description) || regex.test(tags)) {
			ret.push(entry);
		}
	}

	return ret;
}

function initDataGrid(data) {
	var grid = {};
	grid.datatype = 'local';
	grid.height = 300;
	grid.multiselect = false;
	grid.caption = 'Submissions';
	grid.rowNum = 10;
	grid.rowList = [ 10, 20, 30 ];

	grid.colNames = [];
	grid.colModel = [];

	grid.colNames.push('Entry ID');
	grid.colModel.push( {
	  name : 'id',
	  index : 'id',
	  width : 100,
	  hidden : true,
	  sorttype : 'string'
	});
	
	// TODO: Need to write unformatter so jqgrid can sort it, now it's unsortable.
	grid.colNames.push('Created');
	grid.colModel.push( {
	  name : 'created',
	  index : 'created',
	  width : 120,
	  sortype : 'date',
	  formatter : function(cellvalue, options, rowObject) {
		  var date = new Date(cellvalue);
		  return formatDate(date);
	  },
	  sorttype : 'date'
	});

	grid.colNames.push('Video ID');
	grid.colModel.push( {
	  name : 'videoId',
	  index : 'videoId',
	  width : 100,
	  editable : false,
	  hidden : false,
	  sorttype : 'string'
	});

	grid.colNames.push('Assignment');
	grid.colModel.push( {
	  name : 'assignmentId',
	  index : 'assignmentId',
	  width : 80,
	  hidden : false,
	  sorttype : 'string'
	});

	grid.colNames.push('Article');
	grid.colModel.push( {
	  name : 'articleUrl',
	  index : 'articleUrl',
	  width : 50,
	  formatter : function(cellvalue, options, rowObject) {
		  return '<a href="' + cellvalue + '" target="_blank">link</a>';
	  },
	  align : 'center',
	  sorttype : 'string'
	});

	grid.colNames.push('Username');
	grid.colModel.push( {
	  name : 'uploader',
	  index : 'uploader',
	  width : 100,
	  hidden : true,
	  sorttype : 'string'
	});

	grid.colNames.push('Email');
	grid.colModel.push( {
	  name : 'notifyEmail',
	  index : 'notifyEmail',
	  width : 70,
	  sorttype : 'string'
	});

	grid.colNames.push('Video Title');
	grid.colModel.push( {
	  name : 'videoTitle',
	  index : 'videoTitle',
	  width : 100,
	  sorttype : 'string',
	  edittype : 'text'
	});

	grid.colNames.push('Video Description');
	grid.colModel.push( {
	  name : 'videoDescription',
	  index : 'videoDescription',
	  width : 150,
	  hidden: true,
	  edittype : 'text',
	  sorttype : 'string'
	});

	grid.colNames.push('Video Tags');
	grid.colModel.push( {
	  name : 'videoTags',
	  index : 'videoTags',
	  width : 100,
	  edittype : 'text',
	  sorttype : 'string'
	});
	
	grid.colNames.push('View Count');
	grid.colModel.push( {
	  name : 'viewCount',
	  index : 'viewCount',
	  width : 80,
	  sorttype : 'int',
	  formatter : function(cellvalue, options, rowObject) {
	    if (cellvalue < 0) {
	      return 'no data';
	    } else {	      
	      //TODO: Figure out why this needs to be a string value.
	      return '' + cellvalue;
	    }
    }
	});

  grid.colNames.push('Video Source');
  grid.colModel.push( {
    name : 'videoSource',
    index : 'videoSource',
    width : 100,
    edittype : 'text',
    formatter : function(cellvalue, options, rowObject) {
      var ret = null;
      switch (cellvalue) {
      case 0:
        ret = 'New Upload';
        break;
      case 1:
        ret = 'Existing Video';
        break;
      }      
      return ret;
    },
    sorttype : 'string'
  });
	
	grid.colNames.push('Status');
	grid.colModel.push( {
	  name : 'status',
	  index : 'status',
	  width : 100,
	  edittype : 'select',
	  editable : true,
	  editoptions : {
		  value : '0:UNREVIEWED;1:APPROVED;2:REJECTED'
	  },
	  formatter : function(cellvalue, options, rowObject) {
		  return statusToString(cellvalue);
	  },
	  sorttype : 'string'
	});

	grid.colNames.push('Preview');
	grid.colModel.push( {
	  name : 'preview',
	  index : 'preview',
	  width : 75,
	  align : 'center',
	  sortable : false,
	  sorttype : 'string'
	});

  grid.colNames.push('Download');
  grid.colModel.push( {
    name : 'download',
    index : 'download',
    width : 75,
    align : 'center',
    sortable : false,
    sorttype : 'string'
  });	
	
	grid.colNames.push('Delete');
	grid.colModel.push( {
	  name : 'delete',
	  index : 'delete',
	  width : 75,
	  align : 'center',
	  sortable : false,
	  sorttype : 'string'
	});

	grid.afterInsertRow = function(rowid, rowdata, rowelem) {
		var entryId = getEntryId(rowid);
		
		var previewButton = '<input type="button" onclick=previewVideo("' + entryId + '") value="preview" />';
		jQuery('#datagrid').setCell(rowid, 'preview', previewButton);
		
		var deleteButton = '<input type="button" onclick=deleteEntry("' + entryId + '") value="delete" />';
		jQuery('#datagrid').setCell(rowid, 'delete', deleteButton);

    var downloadButton = '<input type="button" onclick=downloadVideo("' + entryId + '") value="download" />';
    jQuery('#datagrid').setCell(rowid, 'download', downloadButton);		
		
		if (rowdata['viewCount'] > 0) {
		  var viewCountLink = 
		      '<a title="Click to download YouTube Insight data." href="/InsightDownloadRedirect?id=' + 
		      rowdata['videoId'] + '&token=' + rowdata['authSubToken'] + '">' + 
		      rowdata['viewCount'] + '</a>';
		  jQuery('#datagrid').setCell(rowid, 'viewCount', viewCountLink);
		}		

	};

	grid.cellsubmit = 'clientArray';

	grid.editurl = 'server.php';
	grid.autoWidth = true;
	grid.cellEdit = true;
	grid.afterSaveCell = function(rowid, cellname, value, iRow, iCol) {
		// save entry as JDO		
		var entryId = getEntryId(rowid);
		var submission = getSubmission(entryId);

		if (typeof (submission[cellname]) != 'undefined') {
			submission[cellname] = value;
		}
		updateSubmission(submission);
	};

	grid.pager = jQuery('#pager');

	var jqGrid = jQuery('#datagrid').jqGrid(grid);

	for ( var i = 0; i <= data.length; i++) {
		jqGrid.addRowData(i + 1, data[i]);
	}

	jqGrid.navGrid('#pager', {
	  edit : false,
	  add : false,
	  del : false,
	  search : false,
	  refresh : false
	}).navButtonAdd('#pager', {
	  caption : "Refresh",
	  onClickButton : function() {
		  refreshGrid();
	  },
	  position : "last"
	});

}

function formatDate(date) {
  var year = padZero(date.getFullYear());
  var month = padZero(date.getMonth() + 1);
  var day = padZero(date.getDate());
  var hours = padZero(date.getHours());
  var minutes = padZero(date.getMinutes());
  var seconds = padZero(date.getSeconds());
  
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

function padZero(value) {
  value = value + '';
  if (value.length < 2) {
    return '0' + value;
  } else {
    return value;
  }
}

function getSubmission(id) {
	var ret = null;

	for ( var i = 0; i < submissions.length; i++) {
		var submission = submissions[i];
		if (submission.id == id) {
			ret = submission;
			break;
		}
	}

	return ret;
}

function getEntryId(rowid) {
	return jQuery("#datagrid").getCell(rowid, 0);
}

function getVideoId(rowid) {
	return jQuery("#datagrid").getCell(rowid, 2);
}

function refreshGrid() {
	getAllSubmissions( function(entries) {
		//entries = preProcessData(entries);
		refreshGridUI(entries);
	});
}

function refreshGridUI(entries) {
	var jqGrid = jQuery('#datagrid').clearGridData();
	for ( var i = 0; i < entries.length; i++) {
		jqGrid.addRowData(i + 1, entries[i]);
	}
}

function downloadVideo(entryId) {
  var submission = window.getSubmission(entryId);
  var videoId = submission.videoId;
  document.location.href = '/VideoDownloadRedirect?id=' + videoId;   
}

function deleteEntry(entryId) {
	if (confirm("Delete this entry?")) {
		var url = '/DeleteSubmission?id=' + entryId;
		var ajaxCall = {};
		ajaxCall.cache = false;
		ajaxCall.type = 'GET';
		ajaxCall.url = url;
		ajaxCall.dataType = 'text';
		ajaxCall.success = function(res) {
			refreshGrid();
		};
		jQuery.ajax(ajaxCall);
	}
}

function previewVideo(entryId) {
  
  var submission = window.getSubmission(entryId);
  var videoId = submission.videoId;
  var title = submission.videoTitle;

	var videoWidth = 275;
	var videoHeight = 250;

  var dialogOptions = {};
  dialogOptions.title = title;
  dialogOptions.width = 400;
  dialogOptions.height = 300;
	
	jQuery.ui.dialog.defaults.bgiframe = true;
	var div = jQuery('<div/>');
	div.html(getVideoHTML(videoId, videoWidth, videoHeight));
	div.dialog(dialogOptions);
}

function preProcessData(data) {

	data = data;

	for ( var i = 0; i < data.length; i++) {
		var entry = data[i];
		// entry.status = statusToString(entry.status);
		entry.videoTags = JSON.parse(entry.videoTags).join(',');
	}

	return data;
}

function postProcessEntry(entry) {
	entry.videoTags = JSON.stringify(entry.videoTags.split(','));
	delete entry.updated; // TODO gson can't parse date by default
	delete entry.preview; // don't include the button
	return entry;
}

function statusToString(status) {

	var newStatus = status;

	if (/^[0-2]$/.test(status)) {
		switch (status) {
		case 0:
			newStatus = 'UNREVIEWED';
			break;
		case 1:
			newStatus = 'APPROVED';
			break;
		case 2:
			newStatus = 'REJECTED';
			break;
		}
	}

	if (newStatus == 'UNREVIEWED') {
		newStatus = '<b>UNREVIEWED</b>';
	}

	return newStatus;
}

function stringToStatus(str) {

	var status = 0;

	switch (str) {
	case 'unreviewed':
		status = 0;
		break;
	case 'approved':
		status = 1;
		break;
	case 'rejected':
		status = 2;
		break;
	}

	return status;
}

function getAllSubmissions(callback) {
	var url = '/GetAllSubmissions';
	var ajaxCall = {};
	ajaxCall.cache = false;
	ajaxCall.type = 'GET';
	ajaxCall.url = url;
	ajaxCall.dataType = 'json';
	ajaxCall.success = function(entries) {
		window.submissions = JSON.parse(JSON.stringify(entries));
		showLoading(false);
		callback(entries);				
	};
	showLoading(true);
	jQuery.ajax(ajaxCall);
}

function updateSubmission(entry) {
	var url = '/UpdateSubmission';
	var ajaxCall = {};
	ajaxCall.type = 'POST';
	ajaxCall.url = url;
	ajaxCall.data = JSON.stringify(entry);
	ajaxCall.cache = false;
	ajaxCall.processData = false;
	ajaxCall.success = function(res) {
		showLoading(false);
	};

	showLoading(true, 'saving ...');
	jQuery.ajax(ajaxCall);

}

function showLoading(status, text) {
	if (status) {
		text = text || 'loading ...';
		jQuery('#status').html(text);
	} else {
		jQuery('#status').html('&nbsp;');
	}
}

function getVideoHTML(videoId, width, height) {

	width = width || 250;
	height = height || 250;

	var youtubeUrl = 'http://www.youtube.com/v/' + videoId;

	var html = [];
	html.push('<object width="' + width + '" height="' + height + '">');
	html.push('<param name="movie" value="');
	html.push(youtubeUrl);
	html.push('&hl=en&fs=1&"></param>');
	html.push('<param name="allowFullScreen" value="true"></param>');
	html.push('<param name="allowscriptaccess" value="always"></param>');
	html.push('<embed src="');
	html.push(youtubeUrl);
	html.push('&hl=en&fs=1&" type="application/x-shockwave-flash"');
	html.push(' allowscriptaccess="always" allowfullscreen="true" width="'
	    + width + '" height="' + height + '">');
	html.push('</embed></object>');

	return html.join('');
}

function showConfigureStatus(text) {
  var status = jQuery('#configureStatus');
  status.html(text);
}

function clearConfigureStatus() {
  jQuery('#configureStatus').empty();
}