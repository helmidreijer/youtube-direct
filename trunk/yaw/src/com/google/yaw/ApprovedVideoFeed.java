package com.google.yaw;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;
import javax.jdo.Query;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.repackaged.com.google.common.base.Log;
import com.google.yaw.Util;
import com.google.yaw.model.VideoSubmission;

public class ApprovedVideoFeed extends HttpServlet {

  private static final Logger log = Logger.getLogger(ApprovedVideoFeed.class.getName());

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    String sortBy = "created";
    String sortOrder = "desc";
    int pageIndex = 1;
    int pageSize = 10;    
    int filterType = 1; // approved
    long assignmentId = -1;
    
    if (req.getParameter("id") != null) {      
      assignmentId = Long.parseLong(req.getParameter("id"));
    }    
    
    if (req.getParameter("sortby") != null) {      
      sortBy = req.getParameter("sortby");
    }
    
    if (req.getParameter("sortorder") != null) {      
      sortOrder = req.getParameter("sortorder");
    }
    
    if (req.getParameter("pageindex") != null) {      
      pageIndex = Integer.parseInt(req.getParameter("pageindex"));
    }    
    
    if (req.getParameter("pagesize") != null) {      
      pageSize = Integer.parseInt(req.getParameter("pagesize"));
    }    

    if (req.getParameter("filtertype") != null) {      
      filterType = Integer.parseInt(req.getParameter("filtertype"));
    }        
    
    PersistenceManagerFactory pmf = Util.getPersistenceManagerFactory();
    PersistenceManager pm = pmf.getPersistenceManager();

    try {
      Query query = pm.newQuery(VideoSubmission.class);
      
      query.declareImports("import java.util.Date");      
      query.setOrdering(sortBy + " " + sortOrder);
      
      if (filterType > -1) {
        String filters = "status == " + filterType; 
        query.setFilter(filters);
      }
      query.declareParameters("long assignmentId_");
      query.setFilter("assignmentId == assignmentId_");
      
      List<VideoSubmission> videoEntries = (List<VideoSubmission>) query.execute(assignmentId);
                  
      int totalSize = videoEntries.size();
      int totalPages = (int) Math.ceil(((double)totalSize/(double)pageSize));
      int startIndex = (pageIndex - 1) * pageSize; //inclusive
      int endIndex = -1; //exclusive
      
      if (pageIndex < totalPages) {
        endIndex = startIndex + pageSize;        
      } else {
        if (pageIndex == totalPages && totalSize % pageSize == 0) {
          endIndex = startIndex + pageSize;                              
        } else {
          endIndex = startIndex + (totalSize % pageSize);  
        }
      }
      
      String json = null; 
      List returnList = videoEntries.subList(startIndex, endIndex);                    
      json = Util.GSON.toJson(returnList);
      json = "{\"total\": \"" + totalSize + "\", \"entries\": " + json + "}";        
        
      resp.setContentType("text/javascript");
      resp.getWriter().println(json);      
    } finally {
      pm.close();
    }
  }
}