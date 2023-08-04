import Modal from "@mui/material/Modal";
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import ListAlt from "@mui/icons-material/List";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { red, green } from '@mui/material/colors';

import { useEffect, useState } from 'react'
import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import axios from 'axios';
import { Domain } from '../libs/interfaces';

interface ModalProps {
  domains: Domain[],
  dpInstanceName: string
}

interface DomainStatus extends Domain {
  sync: string;
}

export default function DomainListModal({ domains, dpInstanceName }: ModalProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [domainStatuses, setDomainStatuses] = useState<DomainStatus[]>([]);

  const handleOpen = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "enabled":
        return <Tooltip title="enabled"><DoneIcon sx={{ color: green[500] }}/></Tooltip>;
      case "disabled":
        return <Tooltip title="disabled"><CloseIcon sx={{ color: red[500] }}/></Tooltip>;
    }
  };

  const syncIcon = (sync: string) => {
    if (sync.includes('is in sync')) {
      return <Tooltip title="is in sync"><SyncAltIcon sx={{ color: 'green' }}/></Tooltip>
    } else  {
      return <Tooltip title="not in sync"><SyncProblemIcon sx={{ color: 'red' }} /></Tooltip>
    }
  }
  const getDomainSyncStatus = async (domain: string): Promise<string> => {
    try {
      const resp = await axios.get<string>('api/domain/' + domain + '/sync');
      const responseData: string = resp.data;
      return responseData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchDataForDomains = async () => {
      const domainStatusPromises = domains.map(async (domain) => {
        const sync = await getDomainSyncStatus(domain.domain);
        return { ...domain, sync };
      });

      const domainStatuses = await Promise.all(domainStatusPromises);
      setDomainStatuses(domainStatuses);
    };

    fetchDataForDomains();
  }, []);

  return (
    <div>
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpen}
        endIcon={<ListAlt />}
      >
        Domains
      </Button>
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '30%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: "50%",
          overflow: "scroll",
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: [2, 4, 3],
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Domains on {dpInstanceName}:
          </Typography>
          <Box id="modal-modal-description" sx={{ mt: 0 }}>
            <List>
              {domainStatuses && (
                domainStatuses.map((domainStatus ) => (
                  <ListItem disablePadding key={domainStatus.domain}>
                    <ListItemButton>
                      <ListItemIcon>
                        { statusIcon(domainStatus.mAdminState)}
                      </ListItemIcon>
                      <ListItemIcon>
                        { syncIcon(domainStatus.sync) }
                      </ListItemIcon>
                      <ListItemText >{domainStatus.domain}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
