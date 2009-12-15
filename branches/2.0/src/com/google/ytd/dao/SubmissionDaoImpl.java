package com.google.ytd.dao;

import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;
import javax.jdo.Query;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.ytd.model.AdminConfig;
import com.google.ytd.model.VideoSubmission;
import com.google.ytd.model.VideoSubmission.ModerationStatus;
import com.google.ytd.util.EmailUtil;
import com.google.ytd.util.Util;

@Singleton
public class SubmissionDaoImpl implements SubmissionDao  {
  private static final Logger LOG = Logger.getLogger(SubmissionDaoImpl .class.getName());

  private PersistenceManagerFactory pmf = null;

  @Inject
  private Util util;
  @Inject
  private EmailUtil emailUtil;
  @Inject
  private AdminConfigDao adminConfigDao;

  @Inject
  public SubmissionDaoImpl(PersistenceManagerFactory pmf) {
    this.pmf = pmf;
  }
  @Override
  public VideoSubmission newSubmission(long assignmentId) {
    return new VideoSubmission(assignmentId);
  }

  @Override
  public List<VideoSubmission> getSubmissions(String sortBy, String sortOrder,
      String filterType) {
    PersistenceManager pm = pmf.getPersistenceManager();
    List<VideoSubmission> submissions = null;

    try {
      Query query = pm.newQuery(VideoSubmission.class);
      query.declareImports("import java.util.Date");
      query.declareParameters("String filterType");
      query.setOrdering(sortBy + " " + sortOrder);

      if (!filterType.toUpperCase().equals("ALL")) {
        String filters = "status == filterType";
        query.setFilter(filters);
      }

      submissions = (List<VideoSubmission>) query.execute(filterType);
      submissions = (List<VideoSubmission>) pm.detachCopyAll(submissions);
    } finally {
      pm.close();
    }

    return submissions;
  }

  @Override
  public VideoSubmission getSubmission(String id) {
    PersistenceManager pm = pmf.getPersistenceManager();
    VideoSubmission submission = null;

    try {
      submission = (VideoSubmission) pm.getObjectById(VideoSubmission.class, id);
    } finally {
      pm.close();
    }

    return submission;
  }

  @Override
  public void setVideoStatus(String id, String status) {
    VideoSubmission submission = getSubmission(id);
    ModerationStatus newStatus = ModerationStatus.valueOf(status);
    ModerationStatus currentStatus = submission.getStatus();

    if (newStatus == currentStatus) {
      // No change in status
      return;
    }

    submission.setStatus(newStatus);
    submission.setUpdated(new Date());
    PersistenceManager pm = pmf.getPersistenceManager();
    try {
      submission = pm.makePersistent(submission);
      submission = pm.detachCopy(submission);
    } finally {
      pm.close();
    }

    switch (newStatus) {
      case APPROVED:
        onApproved(submission);
        break;
      case REJECTED:
      case UNREVIEWED:
      case SPAM:
        onNotApproved(submission);
        break;
    }
  }

  private void onApproved(VideoSubmission submission) {
    AdminConfig adminConfig = adminConfigDao.getAdminConfig();

    // Send notify email
    if (submission.getNotifyEmail() != null && adminConfig.isModerationEmail()) {
      emailUtil.sendNotificationEmail(submission, ModerationStatus.APPROVED);
    }



  }

  private void onNotApproved(VideoSubmission submission) {

  }
  @Override
  public void save(VideoSubmission submission) {
    PersistenceManager pm = pmf.getPersistenceManager();
    try {
      pm.makePersistent(submission);
    } finally {
      pm.close();
    }
  }
}