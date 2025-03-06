
import RecitationUploader from '@/components/RecitationUploader';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container max-w-6xl py-12 px-4 sm:px-6"
      >
        <RecitationUploader />
      </motion.div>
    </div>
  );
};

export default Index;
